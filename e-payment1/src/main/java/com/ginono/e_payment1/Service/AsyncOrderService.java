package com.ginono.e_payment1.Service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.concurrent.CompletableFuture;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AsyncOrderService {
    private static final Logger logger = LoggerFactory.getLogger(AsyncOrderService.class);
    private final RestTemplate restTemplate;
    private final String PROXY_SERVER_URL = "http://localhost:3001/api";

    public AsyncOrderService() {
        this.restTemplate = new RestTemplate();
    }

    @Async
    public CompletableFuture<Map<String, Object>> initiatePayment(String accountId, String phoneNumber, double amount) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of(
                "accountId", accountId,
                "phoneNumber", phoneNumber,
                "amount", amount
            );

            logger.info("Forwarding payment initiation to proxy server for account: {}, phone: {}, amount: {}", 
                accountId, phoneNumber, amount);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> rawResponse = restTemplate.exchange(
                PROXY_SERVER_URL + "/initiate-payment",
                HttpMethod.POST,
                request,
                String.class
            );

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> jsonResponse = mapper.readValue(rawResponse.getBody(), 
                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
            
            if ("success".equals(jsonResponse.get("status"))) {
                logger.info("Payment forwarded successfully. Order ID: {}", jsonResponse.get("order_id"));
                return CompletableFuture.completedFuture(jsonResponse);
            } else {
                throw new RuntimeException("Payment forwarding failed: " + jsonResponse.get("message"));
            }
        } catch (Exception e) {
            logger.error("Error in payment forwarding: {}", e.getMessage());
            return CompletableFuture.failedFuture(e);
        }
    }

    @Async
    public CompletableFuture<Map<String, Object>> checkOrderStatus(String orderId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            logger.info("Checking payment status from proxy (ZenoPay format) for order: {}", orderId);

            String url = PROXY_SERVER_URL + "/fetch-order-status?orderId=" + orderId;
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<String> rawResponse = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                String.class
            );

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> jsonResponse = mapper.readValue(rawResponse.getBody(),
                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});

            logger.info("Order status check (ZenoPay format) for order: {} returned: {}", orderId, jsonResponse);
            return CompletableFuture.completedFuture(jsonResponse);
        } catch (Exception e) {
            logger.error("Error in order status check forwarding: {}", e.getMessage());
            return CompletableFuture.failedFuture(e);
        }
    }
}