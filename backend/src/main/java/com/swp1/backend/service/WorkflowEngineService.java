package com.swp1.backend.service;

import com.swp1.backend.model.PoliticaDeNegocio;
import com.swp1.backend.model.Nodo;
import com.swp1.backend.model.Conexion;
import org.flowable.bpmn.model.*;
import org.flowable.bpmn.model.Process;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.repository.Deployment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WorkflowEngineService {

    @Autowired
    private RepositoryService repositoryService;

    @Autowired
    private RuntimeService runtimeService;

    public void deployPolitica(PoliticaDeNegocio politica) {
        BpmnModel model = new BpmnModel();
        Process process = new Process();
        process.setId("process_" + politica.getId());
        process.setName(politica.getNombre());
        model.addProcess(process);

        // Convertir nodos de Mongo a elementos BPMN
        for (Nodo nodo : politica.getNodos()) {
            if ("START".equals(nodo.getTipo())) {
                StartEvent startEvent = new StartEvent();
                startEvent.setId(nodo.getId());
                process.addFlowElement(startEvent);
            } else if ("END".equals(nodo.getTipo())) {
                EndEvent endEvent = new EndEvent();
                endEvent.setId(nodo.getId());
                process.addFlowElement(endEvent);
            } else if ("ACTIVITY".equals(nodo.getTipo())) {
                UserTask userTask = new UserTask();
                userTask.setId(nodo.getId());
                userTask.setName(nodo.getNombre());
                userTask.setAssignee("${funcionario}"); // Placeholder
                process.addFlowElement(userTask);
            } else if ("DECISION".equals(nodo.getTipo())) {
                ExclusiveGateway gateway = new ExclusiveGateway();
                gateway.setId(nodo.getId());
                process.addFlowElement(gateway);
            } else if ("FORK".equals(nodo.getTipo()) || "JOIN".equals(nodo.getTipo())) {
                ParallelGateway gateway = new ParallelGateway();
                gateway.setId(nodo.getId());
                process.addFlowElement(gateway);
            }
        }

        // Convertir conexiones
        for (Conexion conexion : politica.getConexiones()) {
            SequenceFlow flow = new SequenceFlow();
            flow.setId("flow_" + conexion.getId());
            flow.setSourceRef(conexion.getOrigenId());
            flow.setTargetRef(conexion.getDestinoId());
            if (conexion.getCondicion() != null && !conexion.getCondicion().isEmpty()) {
                flow.setConditionExpression("${outcome == '" + conexion.getCondicion() + "'}");
            }
            process.addFlowElement(flow);
        }

        repositoryService.createDeployment()
                .addBpmnModel(process.getId() + ".bpmn", model)
                .name(politica.getNombre())
                .deploy();
    }

    public void iniciarTramite(String politicaId, String tramiteId) {
        runtimeService.startProcessInstanceByKey("process_" + politicaId, tramiteId);
    }
}
