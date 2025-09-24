package com.ginono.e_payment1.Service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.concurrent.CompletableFuture;

@Service
public class ZenoService {
    private final AsyncOrderService asyncOrderService;
    private static final Logger logger = LoggerFactory.getLogger(ZenoService.class);

    @Autowired
    public ZenoService(AsyncOrderService asyncOrderService) {
        this.asyncOrderService = asyncOrderService;
    }

    public CompletableFuture<Map<String, Object>> initiatePayment(String accountId, String phoneNumber, double amount) {
        logger.info("Delegating payment initiation to AsyncOrderService");
        return asyncOrderService.initiatePayment(accountId, phoneNumber, amount);
    }

    public CompletableFuture<Map<String, Object>> checkOrderStatus(String orderId) {
        logger.info("Delegating order status check to AsyncOrderService");
        return asyncOrderService.checkOrderStatus(orderId);
    }
} 