package com.ginono.e_payment1.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:5173",
                    "192.168.0.231:5173",
                    "172.28.0.1:5173",
                    "192.168.56.1:5173",
                    "https://91d34f294f43.ngrok-free.app",
                    "https://zenoapi.com/api/payments/mobile_money_tanzania",
                    "http://localhost:3001") 
                // React development server
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    // @Bean
    // public CorsFilter corsFilter() {
    //     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    //     CorsConfiguration config = new CorsConfiguration();
        
    //     // Allow React frontend
    //     config.addAllowedOrigin("http://localhost:5173");
        
    //     // Allow Zeno API
    //     config.addAllowedOrigin("http://api.zeno.africa");
        
    //     config.addAllowedHeader("*");
    //     config.addAllowedMethod("*");
    //     config.setAllowCredentials(true);
        
    //     source.registerCorsConfiguration("/**", config);
    //     return new CorsFilter(source);
    // }
} 