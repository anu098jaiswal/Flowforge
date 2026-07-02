package com.example.flowforge.repository;

import com.example.flowforge.entity.TriggerType;
import com.example.flowforge.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkflowRepository extends JpaRepository<Workflow, Long> {

    // Loads the workflow and its actions in ONE query, so the actions
    // list is fully populated before the Hibernate session closes.
    // This is what fixes the "no session" LazyInitializationException:
    // execution can happen on an @Async thread where a lazy fetch on
    // workflow.getActions() would otherwise have no session to pull from.
    @Query("SELECT DISTINCT w FROM Workflow w LEFT JOIN FETCH w.actions WHERE w.id = :id")
    Optional<Workflow> findWithActionsById(@Param("id") Long id);

    List<Workflow> findByTriggerTypeAndActiveTrue(TriggerType triggerType);
}