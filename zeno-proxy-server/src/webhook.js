import http from 'http';
import fs from 'fs';

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let data = '';

        // Collect the raw POST data
        req.on('data', chunk => {
            data += chunk;
        });

        req.on('end', () => {
            // Log the raw data with a timestamp
            const logEntry = `[${new Date().toISOString()}] WebHook Data: ${data}\n`;
            fs.appendFile('weblogs.txt', logEntry, err => {
                if (err) {
                    console.error('Error writing to file:', err);
                }
            });

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Webhook received');
        });
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
}); 