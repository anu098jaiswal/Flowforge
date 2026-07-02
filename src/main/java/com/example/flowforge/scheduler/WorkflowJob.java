package com.example.flowforge.scheduler;

import com.example.flowforge.service.WorkflowExecutionService;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.Map;

public class WorkflowJob implements Job {

    @Autowired
    private WorkflowExecutionService workflowExecutionService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        Long workflowId = (Long) context.getJobDetail().getJobDataMap().get("workflowId");
        Map<String, Object> payload = Map.of(
                "source", "scheduler",
                "firedAt", Instant.now().toString());
        workflowExecutionService.execute(workflowId, payload);
    }
}