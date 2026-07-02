# FlowForge Frontend

A real React app (Vite) that talks to your actual Spring Boot backend - no
simulation, no fake data. Every button here calls the same endpoints you
already tested with curl.

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Your Spring Boot backend must already be
running on `http://localhost:8080` (the URL is hardcoded in `src/api.js` -
change it there if your backend runs somewhere else).

## Before this will work: 3 small backend additions

### 1. CORS - without this, every request will be silently blocked by the browser

Your browser refuses to let JavaScript on `localhost:5173` call
`localhost:8080` unless the backend explicitly allows it. Create a new file
in your Spring Boot project, `com.example.flowforge.config.WebConfig`:

```java
package com.example.flowforge.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

### 2. The `/logs` endpoint - lets the Test panel show what actually happened

Your backend doesn't have a way to fetch a workflow's execution history via
the API yet (only direct SQL queries, which is what you were doing manually
in pgAdmin). Add this to `WorkflowController.java`:

```java
// add these 2 imports at the top
import com.example.flowforge.entity.ExecutionLog;
import com.example.flowforge.repository.ExecutionLogRepository;

// add this field + constructor param alongside the existing workflowService one
private final ExecutionLogRepository executionLogRepository;

public WorkflowController(WorkflowService workflowService,
                           ExecutionLogRepository executionLogRepository) {
    this.workflowService = workflowService;
    this.executionLogRepository = executionLogRepository;
}

// add this new method anywhere inside the class
@GetMapping("/{id}/logs")
public ResponseEntity<List<ExecutionLog>> getLogs(@PathVariable Long id) {
    return ResponseEntity.ok(executionLogRepository.findByWorkflowIdOrderByExecutedAtDesc(id));
}
```

### 3. Stop `ExecutionLog` from re-embedding the whole `Workflow` object

Same idea as the `@JsonIgnore` fix you already applied to `WorkflowAction` -
without it, every log entry would re-serialize its entire parent workflow
(including all its actions) every time. In `ExecutionLog.java`:

```java
import com.fasterxml.jackson.annotation.JsonIgnore;

@ManyToOne
@JoinColumn(name = "workflow_id", nullable = false)
@JsonIgnore
private Workflow workflow;
```

Restart the Spring Boot app after these 3 changes, then `npm run dev` here.

## What you can do in the UI

- **Create a workflow** - pick a trigger (webhook or schedule), an optional
  condition, and chain together Email / API call (Slack lives here too,
  just paste a Slack webhook URL into the URL field) / DB write actions
- **See all workflows** as cards, each showing its trigger, condition, and
  action chain at a glance
- **Test fire** any workflow - type a JSON payload, hit "Fire webhook", and
  see the real execution status come back (SUCCESS / FAILED / SKIPPED) a
  couple seconds later, once the backend's @Async execution finishes
- **Delete** a workflow (cascades to its actions, same as before)

## What's deliberately not here

- Editing an existing workflow (PUT /api/workflows/{id} exists on your
  backend, just no UI for it yet - natural next addition)
- Real-time log streaming (currently just one polled check 1.2s after
  firing - good enough to prove it works, not production-grade)
- Auth - there's no login, anyone with the URL can create/delete workflows.
  Fine for a local portfolio demo, not fine if you ever deploy this publicly
