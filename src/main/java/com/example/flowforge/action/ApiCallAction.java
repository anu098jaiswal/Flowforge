package com.example.flowforge.action;

import com.example.flowforge.entity.ActionType;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class ApiCallAction implements Action {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public ActionType getType() {
        return ActionType.API_CALL;
    }

    @Override
    @SuppressWarnings("unchecked")
    public ActionResult execute(ActionContext context) {
        String url = (String) context.getConfig().get("url");
        String method = (String) context.getConfig().getOrDefault("method", "POST");
        Map<String, Object> body = (Map<String, Object>) context.getConfig().getOrDefault("body", Map.of());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.valueOf(method), entity, String.class);

        return ActionResult.ok("Called " + url + " -> status " + response.getStatusCode());
    }
}