package com.example.flowforge.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "workflows")
public class Workflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TriggerType triggerType;

    // Only used when triggerType = SCHEDULE, e.g. "0 0 9 * * ?"
    private String cronExpression;

    // SpEL filter, e.g. "#payload['amount'] > 1000" — explained when we build the condition evaluator
    private String conditionExpression;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<WorkflowAction> actions = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TriggerType getTriggerType() { return triggerType; }
    public void setTriggerType(TriggerType triggerType) { this.triggerType = triggerType; }

    public String getCronExpression() { return cronExpression; }
    public void setCronExpression(String cronExpression) { this.cronExpression = cronExpression; }

    public String getConditionExpression() { return conditionExpression; }
    public void setConditionExpression(String conditionExpression) { this.conditionExpression = conditionExpression; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<WorkflowAction> getActions() { return actions; }
    public void setActions(List<WorkflowAction> actions) { this.actions = actions; }

    public Instant getCreatedAt() { return createdAt; }
}
