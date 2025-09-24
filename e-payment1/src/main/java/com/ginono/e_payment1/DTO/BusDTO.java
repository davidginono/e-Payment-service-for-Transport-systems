package com.ginono.e_payment1.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusDTO {
    private Long bus_id;
    private String account_id;
    private String plate_number;
    private Long route_id;
}