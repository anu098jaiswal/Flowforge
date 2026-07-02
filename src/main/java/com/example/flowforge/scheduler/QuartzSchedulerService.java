package com.example.flowforge.scheduler;

import com.example.flowforge.entity.Workflow;
import org.quartz.*;
import org.springframework.stereotype.Service;

@Service
public class QuartzSchedulerService {

    private final Scheduler scheduler;

    public QuartzSchedulerService(Scheduler scheduler) {
        this.scheduler = scheduler;
    }

    public void schedule(Workflow workflow) {
        try {
            JobKey jobKey = jobKey(workflow.getId());
            if (scheduler.checkExists(jobKey)) {
                scheduler.deleteJob(jobKey);
            }
            JobDetail jobDetail = JobBuilder.newJob(WorkflowJob.class)
                    .withIdentity(jobKey)
                    .usingJobData("workflowId", workflow.getId())
                    .build();
            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(triggerKey(workflow.getId()))
                    .withSchedule(CronScheduleBuilder.cronSchedule(workflow.getCronExpression()))
                    .build();
            scheduler.scheduleJob(jobDetail, trigger);
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to schedule workflow " + workflow.getId(), e);
        }
    }

    public void unschedule(Long workflowId) {
        if (workflowId == null) return;
        try {
            if (scheduler.checkExists(jobKey(workflowId))) {
                scheduler.deleteJob(jobKey(workflowId));
            }
        } catch (SchedulerException e) {
            throw new RuntimeException("Failed to unschedule workflow " + workflowId, e);
        }
    }

    private JobKey jobKey(Long id) {
        return JobKey.jobKey("workflow-" + id, "workflows");
    }

    private TriggerKey triggerKey(Long id) {
        return TriggerKey.triggerKey("workflow-" + id + "-trigger", "workflows");
    }
}