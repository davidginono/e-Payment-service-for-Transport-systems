package com.ginono.e_payment1.Repository;

import com.ginono.e_payment1.Model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
} 