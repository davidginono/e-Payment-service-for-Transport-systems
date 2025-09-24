package com.ginono.e_payment1.Repository;

import com.ginono.e_payment1.Model.Stop;
import com.ginono.e_payment1.Model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StopRepository extends JpaRepository<Stop, Long> {
    @Query("SELECT s FROM Stop s WHERE s.route_id = :route")
    List<Stop> findByRoute(@Param("route") Route route);
} 