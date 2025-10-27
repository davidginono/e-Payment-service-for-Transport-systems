import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentPage.css';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stop, busId, scanLocation, stops } = location.state || { stop: null, busId: '', scanLocation: null, stops: [] };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // useEffect(() => {
  //    Check if passenger is registered
  //   const passengerId = localStorage.getItem('passengerId');
  //   if (!passengerId) {
  //     navigate('/register');
  //   }
  // }, [navigate]);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const passengerId = localStorage.getItem('passengerId');
      if (!passengerId) {
        setError('Please register first');
        return;
      }

      const paymentData = new URLSearchParams({
        accountId: busId,
        passengerId: passengerId,
        amount: stop.price,
      });

      const paymentResponse = await axios.post(
        `${import.meta.env.VITE_API_BACKEND_URL}/api/payment/initiate`,
        paymentData,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const paymentResult = paymentResponse.data;
      console.log('Payment Initiation Response:', paymentResult);
        console.log('check this out:',paymentResult.status );
        
      if (paymentResult.status === 'success') {
        const orderId = paymentResult.order_id;
        console.log('check this out:',paymentResult.status );
        await new Promise((resolve) => setTimeout(resolve, 4000)); // optional wait

        // Poll for payment status until COMPLETED or timeout
        let statusResult = null;
        let attempts = 0;
        const maxAttempts = 7; // e.g. poll for up to 225 seconds
        const pollInterval = 7000; // 15 seconds
        while (attempts < maxAttempts) {
          const statusResponse = await axios.get(
            `${import.meta.env.VITE_API_BACKEND_URL}/api/payment/status`,
            {
              params: { orderId },
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
          );
          statusResult = statusResponse.data;
          console.log('Payment Status Response:', statusResult);
          // Defensive: check for ZenoPay format (data[0].payment_status) or fallback to payment_status
          const paymentStatus = Array.isArray(statusResult.data) && statusResult.data[0]?.payment_status
            ? statusResult.data[0].payment_status
            : statusResult.payment_status;
          if (paymentStatus === 'COMPLETED') {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
          attempts++;
        }

        // Defensive: check for ZenoPay format (data[0].payment_status) or fallback to payment_status
        const finalStatus = Array.isArray(statusResult?.data) && statusResult.data[0]?.payment_status
          ? statusResult.data[0].payment_status
          : statusResult?.payment_status;
        if (finalStatus === 'COMPLETED') {
          navigate('/success', {
            state: {
              stop,
              busId,
              paymentStatus: Array.isArray(statusResult.data) ? statusResult.data[0] : statusResult,
            },
          });
        } else {
          setError('Payment not completed. Please try again or check later.');
        }
      } else {
        throw new Error(paymentResult.message || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      setError(
        error.response?.data?.message || error.message || 'Payment processing failed'
      );
    } finally{
      setLoading(false);
    }
  };

  if (!stop) {
    return (
      <div className="container">
        <h1>Error</h1>
        <p>No stop information available.</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Confirm Your Journey</h1>
      
      <div className="payment-details">
        <h2>Journey Summary</h2>
        <p>Bus ID: {busId}</p>
        <p>Stop: {stop.stop_name}</p>
        <p>Price: tzs{stop.price}</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button 
        onClick={handleConfirm}
        disabled={loading}
        className="confirm-button"
      >
        {loading ? 'Processing...' : 'PAY'}
      </button>

      <button 
        className="back-button"
        onClick={() => navigate('/journey-preview', { state: { stop, busId, scanLocation, stops } })}
      >
        Back to Journey
      </button>
    </div>
  );
}

export default PaymentPage;
