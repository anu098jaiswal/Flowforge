package com.example.flowforge.controller;

import com.example.flowforge.service.WorkflowExecutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private final WorkflowExecutionService workflowExecutionService;

    public WebhookController(WorkflowExecutionService workflowExecutionService) {
        this.workflowExecutionService = workflowExecutionService;
    }

    @PostMapping("/{workflowId}")
    public ResponseEntity<String> handle(@PathVariable Long workflowId,
                                         @RequestBody Map<String, Object> payload) {
        workflowExecutionService.executeAsync(workflowId, payload);
        return ResponseEntity.accepted().body("Workflow triggered");

    }
}
