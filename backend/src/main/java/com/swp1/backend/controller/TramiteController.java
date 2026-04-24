package com.swp1.backend.controller;

import com.swp1.backend.model.Tramite;
import com.swp1.backend.repository.TramiteRepository;
import com.swp1.backend.service.WorkflowEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/tramites")
@CrossOrigin(origins = "*")
public class TramiteController {

    @Autowired
    private TramiteRepository tramiteRepository;

    @Autowired
    private WorkflowEngineService workflowEngineService;

    @GetMapping
    public List<Tramite> getAll() {
        return tramiteRepository.findAll();
    }

    @PostMapping("/iniciar")
    public Tramite iniciar(@RequestBody Map<String, String> payload) {
        String politicaId = payload.get("politicaId");
        String cliente = payload.get("cliente");

        Tramite tramite = new Tramite();
        tramite.setPoliticaId(politicaId);
        tramite.setCliente(cliente);
        tramite.setEstado("EN_PROCESO");
        tramite.setFechaInicio(LocalDateTime.now());
        
        // El nodo actual después de START es la primera actividad
        // En Flowable, al iniciar, se posiciona en el primer nodo ejecutable
        tramite = tramiteRepository.save(tramite);

        workflowEngineService.iniciarTramite(politicaId, tramite.getId());
        
        // Actualizar el nodo inicial
        String nodoInicial = workflowEngineService.getNodoActual(tramite.getId());
        tramite.setNodoActualId(nodoInicial);
        return tramiteRepository.save(tramite);
    }

    @PostMapping("/{id}/completar")
    public Tramite completar(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        Tramite tramite = tramiteRepository.findById(id).orElseThrow();
        
        // Enviar datos al motor (variables de proceso)
        Map<String, Object> variables = (Map<String, Object>) payload.get("datos");
        workflowEngineService.completarTarea(id, variables);

        // Actualizar el estado del trámite en Mongo
        String siguienteNodo = workflowEngineService.getNodoActual(id);
        tramite.setNodoActualId(siguienteNodo);
        
        if ("FIN".equals(siguienteNodo)) {
            tramite.setEstado("FINALIZADO");
        }

        return tramiteRepository.save(tramite);
    }
}
