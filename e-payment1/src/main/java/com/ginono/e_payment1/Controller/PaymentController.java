package com.ginono.e_payment1.Controller;

import com.ginono.e_payment1.Model.Passenger;
import com.ginono.e_payment1.Repository.PassengerRepository;
import com.ginono.e_payment1.Service.ZenoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.service.annotation.GetExchange;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@CrossOrigin
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private ZenoService zenoService;

    @Autowired
    private PassengerRepository passengerRepository;

    @PostMapping("/initiate")
    @CrossOrigin
    public CompletableFuture<ResponseEntity<Map<String, Object>>> initiatePayment(
            @RequestParam String accountId,
            @RequestParam String passengerId,
            @RequestParam double amount) {
        
        try {
            Long passengerIdLong = Long.parseLong(passengerId);
            Passenger passenger = passengerRepository.findById(passengerIdLong)
                    .orElseThrow(() -> new RuntimeException("Passenger not found"));

            if (passenger.getEmail() == null || passenger.getEmail().isEmpty()) {
                return CompletableFuture.completedFuture(ResponseEntity.badRequest().body(Map.<String, Object>of(
                    "status", "error",
                    "message", "Email not found for passenger"
                )));
            }

            if (passenger.getPhone() == null || passenger.getPhone().isEmpty()) {
                return CompletableFuture.completedFuture(ResponseEntity.badRequest().body(Map.<String, Object>of(
                    "status", "error",
                    "message", "Phone number not found for passenger"
                )));
            }
            
            return zenoService.initiatePayment(accountId, passenger.getPhone(), amount)
                .thenApply(response -> ResponseEntity.ok(response))
                .exceptionally(e -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.<String, Object>of(
                        "status", "error",
                        "message", e.getMessage()
                    )));

        } catch (NumberFormatException e) {
            return CompletableFuture.completedFuture(ResponseEntity.badRequest().body(Map.<String, Object>of(
                "status", "error",
                "message", "Invalid passenger ID format"
            )));
        } catch (RuntimeException e) {
            return CompletableFuture.completedFuture(ResponseEntity.badRequest().body(Map.<String, Object>of(
                "status", "error",
                "message", e.getMessage()
            )));
        }
    }

    @GetMapping("/status")
    @CrossOrigin
    public CompletableFuture<ResponseEntity<Map<String, Object>>> checkPaymentStatus(
            @RequestParam String orderId) {
        
        return zenoService.checkOrderStatus(orderId)
            .thenApply(response -> ResponseEntity.ok(response))
            .exceptionally(e -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.<String, Object>of(
                    "status", "error",
                    "message", e.getMessage()
                )));
    }
} 