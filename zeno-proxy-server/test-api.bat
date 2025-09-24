@echo off
echo Testing ZenoPay API Integration...

echo.
echo Test 1: Initiating Payment
curl -X POST ^
  -H "Content-Type: application/json" ^
  -d "{\"accountId\": \"zp51883\", \"phoneNumber\": \"0746359369\", \"amount\": 200.0}" ^
  http://localhost:3001/api/initiate-payment

timeout /t 2 /nobreak > nul

echo.
echo Test 2: Checking Order Status
curl -X POST ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\": \"ORDER_ID\"}" ^
  http://localhost:3001/api/check-order-status

echo.
echo Test 3: Simulating Webhook
curl -X POST ^
  -H "Content-Type: application/json" ^
  -d "{\"order_id\": \"test_order_123\", \"status\": \"completed\", \"amount\": 200.0, \"timestamp\": \"%date:~-4%-%date:~3,2%-%date:~0,2%T%time:~0,8%Z\"}" ^
  http://localhost:3001/api/webhook

echo.
echo API Tests Completed 