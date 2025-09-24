import express from 'express';
import { triggerPayment, checkOrderStatus } from './trigger-api.js';

const app = express();
app.use(express.json());

// Endpoint that matches AsyncOrderService.java's endpoint
app.post('/api/initiate-payment', async (req, res) => {
    try {
        const { accountId, phoneNumber, amount } = req.body;
        
        // Automatically trigger the payment
        const response = await triggerPayment(accountId, phoneNumber, amount);
        
        res.json({
            status: 'success',
            order_id: response.order_id,
            message: 'Payment initiated successfully'
        });
    } catch (error) {
        console.error('Error in payment initiation:', error);
        res.status(500).json({
            status: 'error',
            message: error.response?.data?.message || 'Failed to initiate payment'
        });
    }
});

// Endpoint for checking order status
app.post('/api/check-order-status', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        // Automatically check order status
        const response = await checkOrderStatus(orderId);
        
        res.json({
            status: 'success',
            order_status: response.status,
            message: 'Order status retrieved successfully'
        });
    } catch (error) {
        console.error('Error in order status check:', error);
        res.status(500).json({
            status: 'error',
            message: error.response?.data?.message || 'Failed to check order status'
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Auto-trigger server listening on port ${PORT}`);
}); 