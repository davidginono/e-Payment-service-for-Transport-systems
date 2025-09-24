package com.ginono.e_payment1.Repository;

import com.ginono.e_payment1.Model.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {
    Passenger findByPhone(String phone);
    Passenger findByEmail(String email);
} 