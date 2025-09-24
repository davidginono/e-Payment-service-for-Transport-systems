package com.ginono.e_payment1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class E_payment1Application {
    public static void main(String[] args) {
        SpringApplication.run(E_payment1Application.class, args);
    }
} 