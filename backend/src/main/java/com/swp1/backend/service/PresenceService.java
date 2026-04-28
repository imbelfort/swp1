package com.swp1.backend.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {
    
    // Map of SessionId -> UserInfo (which includes policyId)
    private final Map<String, Map<String, String>> activeSessions = new ConcurrentHashMap<>();

    public void addSession(String sessionId, String policyId, String username, String color) {
        Map<String, String> userInfo = new HashMap<>();
        userInfo.put("sessionId", sessionId);
        userInfo.put("policyId", policyId);
        userInfo.put("username", username);
        userInfo.put("color", color);
        activeSessions.put(sessionId, userInfo);
    }

    public Map<String, String> removeSession(String sessionId) {
        return activeSessions.remove(sessionId);
    }

    public List<Map<String, String>> getUsersForPolicy(String policyId) {
        List<Map<String, String>> users = new ArrayList<>();
        for (Map<String, String> info : activeSessions.values()) {
            if (policyId.equals(info.get("policyId"))) {
                users.add(info);
            }
        }
        return users;
    }
}
