package com.ginono.e_payment1.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StopDTO {
    private Long stop_id;
    private Long route_id;  // Only the ID, not the whole Route object
    private String stop_name;
    private Double price;
} 