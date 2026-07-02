package com.example.flowforge.service;

import com.example.flowforge.action.ActionExecutor;
import com.example.flowforge.action.ActionResult;
import com.example.flowforge.action.TemplateRenderer;
import com.example.flowforge.condition.ConditionEvaluator;
import com.example.flowforge.entity.ExecutionLog;
import com.example.flowforge.entity.ExecutionStatus;
import com.example.flowforge.entity.Workflow;
import com.example.flowforge.entity.WorkflowAction;
import com.example.flowforge.repository.ExecutionLogRepository;
import com.example.flowforge.repository.WorkflowRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.transaction.annotation.Transactional;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class WorkflowExecutionService {

    private final WorkflowRepository workflowRepository;
    private final ExecutionLogRepository executionLogRepository;
    private final ConditionEvaluator conditionEvaluator;
    private final ActionExecutor actionExecutor;
    private final TemplateRenderer templateRenderer;
    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    public WorkflowExecutionService(WorkflowRepository workflowRepository,
                                    ExecutionLogRepository executionLogRepository,
                                    ConditionEvaluator conditionEvaluator,
                                    ActionExecutor actionExecutor,
                                    TemplateRenderer templateRenderer) {
        this.workflowRepository = workflowRepository;
        this.executionLogRepository = executionLogRepository;
        this.conditionEvaluator = conditionEvaluator;
        this.actionExecutor = actionExecutor;
        this.templateRenderer = templateRenderer;
    }

    @Async
    public void executeAsync(Long workflowId, Map<String, Object> payload) {
        execute(workflowId, payload);
    }

    @SuppressWarnings("unchecked")
    @Transactional
    public void execute(Long workflowId, Map<String, Object> payload) {
        Workflow workflow = workflowRepository.findWithActionsById(workflowId)
                .orElseThrow(() -> new IllegalArgumentException("Workflow not found: " + workflowId));
        if (!workflow.isActive()) {
            return;
        }

        ExecutionLog log = new ExecutionLog();
        log.setWorkflow(workflow);

        try {
            log.setPayloadJson(jsonMapper.writeValueAsString(payload));

            boolean shouldRun = conditionEvaluator.evaluate(workflow.getConditionExpression(), payload);
            if (!shouldRun) {
                log.setStatus(ExecutionStatus.SKIPPED);
                log.setErrorMessage("Condition not met");
                executionLogRepository.save(log);
                return;
            }

            Map<String, String> results = new LinkedHashMap<>();
            for (WorkflowAction action : workflow.getActions()) {
                Map<String, Object> config = jsonMapper.readValue(action.getConfigJson(), Map.class);
                Map<String, Object> renderedConfig = templateRenderer.renderMap(config, payload);

                ActionResult result = actionExecutor.run(action.getActionType(), renderedConfig, payload);
                results.put(action.getActionType().name() + "#" + action.getOrderIndex(), result.getMessage());

                if (!result.isSuccess()) {
                    log.setStatus(ExecutionStatus.FAILED);
                    log.setErrorMessage(result.getMessage());
                    log.setResultJson(jsonMapper.writeValueAsString(results));
                    executionLogRepository.save(log);
                    return;
                }
            }

            log.setStatus(ExecutionStatus.SUCCESS);
            log.setResultJson(jsonMapper.writeValueAsString(results));
        } catch (Exception e) {
            log.setStatus(ExecutionStatus.FAILED);
            log.setErrorMessage(e.getMessage());
        }

        executionLogRepository.save(log);
    }
}