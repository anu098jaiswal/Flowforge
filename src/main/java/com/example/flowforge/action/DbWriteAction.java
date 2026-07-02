package com.example.flowforge.action;

import com.example.flowforge.entity.ActionType;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;

@Component
public class DbWriteAction implements Action {

    private final JdbcTemplate jdbcTemplate;
    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    public DbWriteAction(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public ActionType getType() {
        return ActionType.DB_WRITE;
    }

    @Override
    public ActionResult execute(ActionContext context) throws Exception {
        String json = jsonMapper.writeValueAsString(context.getPayload());

        jdbcTemplate.update(
                "INSERT INTO dynamic_records (data, created_at) VALUES (?::jsonb, ?)",
                json, Timestamp.from(Instant.now()));

        return ActionResult.ok("Record written to dynamic_records");
    }
}