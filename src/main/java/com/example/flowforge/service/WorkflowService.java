package com.example.flowforge.service;

import com.example.flowforge.entity.TriggerType;
import com.example.flowforge.entity.Workflow;
import com.example.flowforge.repository.WorkflowRepository;
import com.example.flowforge.scheduler.QuartzSchedulerService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final QuartzSchedulerService quartzSchedulerService;

    public WorkflowService(WorkflowRepository workflowRepository,
                           QuartzSchedulerService quartzSchedulerService) {
        this.workflowRepository = workflowRepository;
        this.quartzSchedulerService = quartzSchedulerService;
    }

    public Workflow create(Workflow workflow) {
        workflow.getActions().forEach(a -> a.setWorkflow(workflow));
        Workflow saved = workflowRepository.save(workflow);
        syncSchedule(saved);
        return saved;
    }

    public Workflow update(Long id, Workflow updated) {
        Workflow existing = findById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setTriggerType(updated.getTriggerType());
        existing.setCronExpression(updated.getCronExpression());
        existing.setConditionExpression(updated.getConditionExpression());
        existing.setActive(updated.isActive());
        existing.getActions().clear();
        updated.getActions().forEach(a -> a.setWorkflow(existing));
        existing.getActions().addAll(updated.getActions());
        Workflow saved = workflowRepository.save(existing);
        syncSchedule(saved);
        return saved;
    }

    public void delete(Long id) {
        quartzSchedulerService.unschedule(id);
        workflowRepository.deleteById(id);
    }

    public List<Workflow> findAll() {
        return workflowRepository.findAll();
    }

    public Workflow findById(Long id) {
        return workflowRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Workflow not found: " + id));
    }

    private void syncSchedule(Workflow workflow) {
        boolean shouldBeScheduled = workflow.getTriggerType() == TriggerType.SCHEDULE
                && workflow.isActive()
                && workflow.getCronExpression() != null;
        if (shouldBeScheduled) {
            quartzSchedulerService.schedule(workflow);
        } else {
            quartzSchedulerService.unschedule(workflow.getId());
        }
    }
}