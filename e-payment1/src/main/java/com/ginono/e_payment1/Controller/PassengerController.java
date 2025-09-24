package com.ginono.e_payment1.Controller;

import com.ginono.e_payment1.Model.Passenger;
import com.ginono.e_payment1.Repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/api/passenger")
public class PassengerController {

    @Autowired
    private PassengerRepository passengerRepository;

    @PostMapping("/register")
    public ResponseEntity<Passenger> registerPassenger(@RequestBody Passenger passenger) {
        // Check if passenger with same phone number already exists
        Passenger existingPassenger = passengerRepository.findByPhone(passenger.getPhone());
        if (existingPassenger != null) {
            return ResponseEntity.badRequest().body(existingPassenger);
        }

        // Save new passenger
        Passenger savedPassenger = passengerRepository.save(passenger);
        return ResponseEntity.ok(savedPassenger);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Passenger> getPassenger(@PathVariable Long id) {
        return passengerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<Passenger> getPassengerByPhone(@PathVariable String phone) {
        Passenger passenger = passengerRepository.findByPhone(phone);
        if (passenger == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(passenger);
    }

    // @GetMapping("/verify-email/{email}")
    // public ResponseEntity<Boolean> verifyEmail(@PathVariable String email) {
    //     Passenger passenger = passengerRepository.findByEmail(email);
    //     return ResponseEntity.ok(passenger != null);
   // }
} 