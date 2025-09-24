// Use ES module import
import axios from 'axios'; // Import axios
import qs from 'qs'; // Import qs (for x-www-form-urlencoded)

const url = 'http://localhost:3001/api/initiate-payment';

// Data to be sent
const data = {
  accountId: 'zp51883',
  phoneNumber: '0746359369',
  amount: 200
};

// Convert data to x-www-form-urlencoded format
const formattedData = qs.stringify(data);

// Send POST request to the Zeno API
axios.post(url, formattedData, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
.then(response => {
  console.log('Response:', response.data);
})
.catch(error => {
  console.error('Error:', error.response ? error.response.data : error.message);
}); 