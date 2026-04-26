package com.swp1.backend.controller;

import com.swp1.backend.model.LogActividad;
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
        
        Map<String, Object> extraData = (Map<String, Object>) payload.get("datos");
        Map<String, Object> variables = (Map<String, Object>) extraData.get("variables");
        String nodoId = (String) payload.get("nodoId");
        String nombreNodo = (String) extraData.get("nombreNodo");
        String informeIA = (String) extraData.get("informeIA");
        List<Map<String, Object>> camposMap = (List<Map<String, Object>>) extraData.get("campos");

        // Enviar datos al motor (variables de proceso)
        workflowEngineService.completarTarea(id, variables);

        // Guardar en el historial
        LogActividad log = new LogActividad();
        log.setNodoId(nodoId);
        log.setNombreNodo(nombreNodo);
        log.setUsuario("Funcionario");
        LocalDateTime now = LocalDateTime.now();
        log.setFechaCompletado(now);
        log.setInformeIA(informeIA);

        long duracion = 0;
        if (tramite.getHistorial() == null || tramite.getHistorial().isEmpty()) {
            duracion = java.time.Duration.between(tramite.getFechaInicio(), now).toSeconds();
        } else {
            LogActividad anterior = tramite.getHistorial().get(tramite.getHistorial().size() - 1);
            duracion = java.time.Duration.between(anterior.getFechaCompletado(), now).toSeconds();
        }
        log.setDuracionSegundos(duracion);

        List<com.swp1.backend.model.CampoFormulario> campos = new java.util.ArrayList<>();
        if(camposMap != null) {
            for(Map<String, Object> cmap : camposMap) {
                com.swp1.backend.model.CampoFormulario cf = new com.swp1.backend.model.CampoFormulario();
                cf.setNombre((String) cmap.get("nombre"));
                cf.setEtiqueta((String) cmap.get("etiqueta"));
                cf.setTipo((String) cmap.get("tipo"));
                Object valorObj = cmap.get("valor");
                cf.setValor(valorObj != null ? String.valueOf(valorObj) : "");
                campos.add(cf);
            }
        }
        log.setDatosFormulario(campos);

        if(tramite.getHistorial() == null) {
            tramite.setHistorial(new java.util.ArrayList<>());
        }
        tramite.getHistorial().add(log);

        // Actualizar el estado del trámite en Mongo
        String siguienteNodo = workflowEngineService.getNodoActual(id);
        tramite.setNodoActualId(siguienteNodo);
        
        if ("FIN".equals(siguienteNodo)) {
            tramite.setEstado("FINALIZADO");
        }

        return tramiteRepository.save(tramite);
    }
}
