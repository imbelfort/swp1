package com.swp1.backend.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.util.Map;

@Controller
public class CollaborationController {

    @MessageMapping("/designer/sync/{policyId}")
    @SendTo("/topic/policy/{policyId}")
    public Map<String, Object> syncWorkflow(@DestinationVariable String policyId, @Payload Map<String, Object> state) {
        // Broadcasts the payload (which includes nodes, connections, and senderId) 
        // to all subscribers of /topic/policy/{policyId}
        return state;
    }
}
