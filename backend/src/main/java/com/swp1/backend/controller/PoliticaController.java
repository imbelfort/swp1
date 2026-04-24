package com.swp1.backend.controller;

import com.swp1.backend.model.PoliticaDeNegocio;
import com.swp1.backend.repository.PoliticaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/politicas")
@CrossOrigin(origins = "*")
public class PoliticaController {

    @Autowired
    private PoliticaRepository politicaRepository;

    @GetMapping
    public List<PoliticaDeNegocio> getAll() {
        return politicaRepository.findAll();
    }

    @PostMapping
    public PoliticaDeNegocio save(@RequestBody PoliticaDeNegocio politica) {
        return politicaRepository.save(politica);
    }

    @GetMapping("/{id}")
    public PoliticaDeNegocio getById(@PathVariable String id) {
        return politicaRepository.findById(id).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        politicaRepository.deleteById(id);
    }
}
