package com.example.flowforge.repository;

import com.example.flowforge.entity.ExecutionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExecutionLogRepository extends JpaRepository<ExecutionLog, Long> {
    List<ExecutionLog> findByWorkflowIdOrderByExecutedAtDesc(Long workflowId);
}