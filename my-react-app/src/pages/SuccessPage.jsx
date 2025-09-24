import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SuccessPage.css';

function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stop, busId, paymentStatus } = location.state || { 
    stop: null, 
    busId: '',
    paymentStatus: null
  };

  // Use new payment status format (from webhook/proxy)
  const paymentCompleted = paymentStatus?.payment_status === 'COMPLETED';

  return (
    <div className="container">
      <div className="success-container">
        <h1>Payment {paymentCompleted ? 'Successful' : 'Status'}</h1>
        
        {paymentCompleted ? (
          <div className="success-icon">✓</div>
        ) : (
          <div className="status-icon">!</div>
        )}
        
        <div className="ticket-details">
          <h2>Your Ticket</h2>
          <p>Bus ID: {busId}</p>
          <p>Stop: {stop?.stop_name}</p>
          <p>Price: tsz{stop?.price}</p>
          <p> Time: {new Date().toLocaleString()} </p>
        </div>

        {paymentStatus && (
          <div className={`payment-status ${paymentCompleted ? 'COMPLETED' : paymentStatus.payment_status || 'UNKNOWN'}`}>
            <h3>Payment Status</h3>
            <p>Status: {paymentStatus.payment_status}</p>
            {paymentStatus.order_id && <p>Order ID: {paymentStatus.order_id}</p>}
          </div>
        )}

        <div className="instructions">
          <h3>Next Steps</h3>
          <p>1. Show this ticket to the bus driver</p>
          <p>2. Keep your ticket for the duration of your journey</p>
          <p>3. Have a safe trip!</p>
        </div>

        <button 
          className="home-button"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default SuccessPage;