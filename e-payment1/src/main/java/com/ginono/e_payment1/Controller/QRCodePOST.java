package com.ginono.e_payment1.Controller;

import com.ginono.e_payment1.Model.Stop;
import com.ginono.e_payment1.Model.Bus;
import com.ginono.e_payment1.DTO.BusDTO;
import com.ginono.e_payment1.DTO.StopDTO;
import com.ginono.e_payment1.Repository.StopRepository;
import com.ginono.e_payment1.Repository.BusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
public class QRCodePOST {
    @Autowired
    private StopRepository stopRepository;
    
    @Autowired
    private BusRepository busRepository;

    @GetMapping("/buses")
    public ResponseEntity<List<BusDTO>> getAllBuses() {
        List<Bus> buses = busRepository.findAll();
        List<BusDTO> busDTOs = buses.stream()
            .map(bus -> new BusDTO(
                bus.getBus_id(),
                bus.getAccount_id(),
                bus.getPlate_number(),
                bus.getRoute_id().getRoute_id()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(busDTOs);
    }

    @PostMapping("/bus/{busId}/stops")
    public ResponseEntity<List<StopDTO>> replyQR(@PathVariable Long busId) {
        Optional<Bus> busOptional = busRepository.findById(busId);
        
        if (busOptional.isPresent()) {
            Bus bus = busOptional.get();
            List<Stop> stops = stopRepository.findByRoute(bus.getRoute_id());
            List<StopDTO> stopDTOs = stops.stream()
                .map(stop -> new StopDTO(
                    stop.getStop_id(),
                    stop.getRoute_id().getRoute_id(),
                    stop.getStop_name(),
                    stop.getPrice()
                ))
                .collect(Collectors.toList());
            return ResponseEntity.ok(stopDTOs);
        }
        return ResponseEntity.notFound().build();
    }
}
