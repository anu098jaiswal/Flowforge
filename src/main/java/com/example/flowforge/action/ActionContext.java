package com.example.flowforge.action;

import java.util.Map;

public class ActionContext {

    private final Map<String, Object> config;
    private final Map<String, Object> payload;

    public ActionContext(Map<String, Object> config, Map<String, Object> payload) {
        this.config = config;
        this.payload = payload;
    }

    public Map<String, Object> getConfig() { return config; }
    public Map<String, Object> getPayload() { return payload; }
}