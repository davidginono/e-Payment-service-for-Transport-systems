import axios from 'axios';
import qs from 'qs';

// Zeno API configuration (matching server.js)
const ZENO_API_URL = 'https://api.zeno.africa';
const ACCOUNT_ID = 'zp51883';
const API_KEY = 'null';  // Using string 'null' as instructed
const SECRET_KEY = 'null';  // Using string 'null' as instructed

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to trigger payment with retry logic
async function triggerPayment(accountId, phoneNumber, amount) {
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const data = {
                buyer_name: 'Customer',
                buyer_phone: phoneNumber,
                buyer_email: 'customer@example.com',
                amount: amount,
                account_id: accountId,
                secret_key: SECRET_KEY,
                api_key: API_KEY
            };

            const formattedData = qs.stringify(data);

            const response = await axios.post(ZENO_API_URL, formattedData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000 // 10 second timeout
            });

            console.log('Payment Response:', response.data);
            return response.data;
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt < MAX_RETRIES) {
                await delay(RETRY_DELAY * attempt);
            }
        }
    }
    
    throw new Error(`Failed after ${MAX_RETRIES} attempts. Last error: ${lastError.message}`);
}

// Function to check order status with retry logic
async function checkOrderStatus(orderId) {
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const data = {
                order_id: orderId,
                account_id: ACCOUNT_ID,
                secret_key: SECRET_KEY,
                api_key: API_KEY
            };

            const formattedData = qs.stringify(data);

            const response = await axios.post(`${ZENO_API_URL}/api/check-status`, formattedData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 100000 // 100 second timeout
            });

            console.log('Order Status Response:', response.data);
            return response.data;
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt < MAX_RETRIES) {
                await delay(RETRY_DELAY * attempt);
            }
        }
    }
    
    throw new Error(`Failed after ${MAX_RETRIES} attempts. Last error: ${lastError.message}`);
}

// Export the functions
export { triggerPayment, checkOrderStatus };