package com.example.flowforge.controller;

import com.example.flowforge.entity.ExecutionLog;
import com.example.flowforge.entity.Workflow;
import com.example.flowforge.repository.ExecutionLogRepository;
import com.example.flowforge.service.WorkflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    private final WorkflowService workflowService;
    private final ExecutionLogRepository executionLogRepository;

    public WorkflowController(WorkflowService workflowService,
                              ExecutionLogRepository executionLogRepository) {
        this.workflowService = workflowService;
        this.executionLogRepository = executionLogRepository;
    }

    @PostMapping
    public ResponseEntity<Workflow> create(@RequestBody Workflow workflow) {
        return ResponseEntity.ok(workflowService.create(workflow));
    }

    @GetMapping
    public ResponseEntity<List<Workflow>> findAll() {
        return ResponseEntity.ok(workflowService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workflow> findById(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.findById(id));
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<ExecutionLog>> getLogs(@PathVariable Long id) {
        return ResponseEntity.ok(executionLogRepository.findByWorkflowIdOrderByExecutedAtDesc(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workflow> update(@PathVariable Long id, @RequestBody Workflow workflow) {
        return ResponseEntity.ok(workflowService.update(id, workflow));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workflowService.delete(id);
        return ResponseEntity.noContent().build();
    }
}