import express from 'express';
import axios from 'axios';
import qs from 'qs';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Zeno API configuration
const ZENO_API_URL = ' https://zenoapi.com/api/payments/mobile_money_tanzania';
const ACCOUNT_ID = 'zp51883';
const API_KEY = 'f1ltRDbkENStiWcpguznrNCPox7rZyMkA1nJgyrkQPIBldBKUu083KWmWxGVmqVMhFHNs4Fbx-e5XQLabXn_vA';
const { WEBLOC } = process.env;
// Payment initiation endpoint
app.post('/api/initiate-payment', async (req, res) => {
    try {
    const { accountId, phoneNumber, amount } = req.body;
    // Set your webhook URL here
    const WEBHOOK_URL = `${WEBLOC}/payment-webhook`; // TODO: Edit this to your actual webhook endpoint
        // Basic input validation
        if (!accountId || !phoneNumber || !amount) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: accountId, phoneNumber, or amount.'
            });
        }

        const data = {
            order_id: `order_${Date.now()}`,
            buyer_email: 'customer@example.com',
            buyer_name: 'Customer',
            buyer_phone: phoneNumber,
            amount: amount,
            webhook_url: WEBHOOK_URL
        };

        const formattedData = qs.stringify(data);

        const response = await axios.post(ZENO_API_URL, formattedData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-api-key': API_KEY
            }
        });

        res.json({
            status: response.data.status,
            order_id: response.data.order_id,
            message: 'Payment initiated successfully (await webhook for status)'
        });
    } catch (error) {
        console.error('Error initiating payment:', error.response?.data || error.message);
        res.status(500).json({
            status: error.response?.data?.status || 'error',
            message: error.response?.data?.message || 'Failed to initiate payment',
            exception: {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        });
    }
});

// In-memory store for webhook payment statuses (for demo; use a DB in production)
const paymentStatusStore = {};

// Webhook endpoint to receive payment status updates from ZenoPay
app.post('/payment-webhook', (req, res) => {
    const { order_id, payment_status } = req.body;
    if (order_id && payment_status) {
        paymentStatusStore[order_id] = payment_status;
        console.log(`Webhook received: order_id=${order_id}, payment_status=${payment_status}`);
        res.json({ status: 'success' });
    } else {
        res.status(400).json({ status: 'error', message: 'Invalid webhook payload' });
    }
});

// Endpoint to check the latest payment status (from webhook)
app.get('/api/check-order-status', (req, res) => {
    const { orderId } = req.query;
    if (!orderId) {
        return res.status(400).json({ status: 'error', message: 'Missing required field: orderId.' });
    }
    const status = paymentStatusStore[orderId];
    if (status) {
        res.json({ status: 'success', order_id: orderId, payment_status: status });
    } else {
        res.json({ status: 'pending', order_id: orderId, payment_status: null, message: 'No webhook update received yet.' });
    }
});

// Endpoint to fetch order status directly from ZenoPay and return in ZenoPay's format
app.get('/api/fetch-order-status', async (req, res) => {
    const { orderId } = req.query;
    if (!orderId) {
        return res.status(400).json({ resultcode: '400', result: 'ERROR', message: 'Missing required field: orderId.' });
    }
    try {
        const response = await axios.get(
            'https://zenoapi.com/api/payments/order-status',
            {
                params: { order_id: orderId },
                headers: { 'x-api-key': API_KEY }
            }
        );
        // Forward ZenoPay's response as-is
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching order status from ZenoPay:', error.response?.data || error.message);
        res.status(500).json({
            resultcode: '500',
            result: 'ERROR',
            message: error.response?.data?.message || 'Failed to fetch order status',
            exception: {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        });
    }
});

// Webhook endpoint
    // app.post('/api/webhook', (req, res) => {
    //     const webhookData = JSON.stringify(req.body);
    //     const timestamp = new Date().toISOString();
    //     const logEntry = `[${timestamp}] Webhook Data: ${webhookData}\n`;

    //     fs.appendFile('weblogs.txt', logEntry, (err) => {
    //         if (err) {
    //             console.error('Error writing to webhook log:', err);
    //             res.status(500).json({ status: 'error', message: 'Failed to log webhook data' });
    //         } else {
    //             res.json({ status: 'success', message: 'Webhook received and logged' });
    //         }
    //     });
    // });

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});