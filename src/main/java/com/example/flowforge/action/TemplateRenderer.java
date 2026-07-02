package com.example.flowforge.action;

import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Replaces {{fieldName}} placeholders in an action's config values with the
 * matching value from the trigger payload. Example:
 *
 *   config:  { "to": "{{from}}", "subject": "Re: {{subject}}" }
 *   payload: { "from": "a@b.com", "subject": "Hello" }
 *   result:  { "to": "a@b.com",  "subject": "Re: Hello" }
 *
 * Supports dotted paths ({{customer.email}}) for nested payload maps.
 * Missing keys are replaced with an empty string rather than throwing,
 * so a workflow doesn't hard-fail just because a template referenced a
 * field a particular payload didn't include.
 */
@Component
public class TemplateRenderer {

    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{\\s*([\\w.]+)\\s*}}");

    public Map<String, Object> renderMap(Map<String, Object> config, Map<String, Object> payload) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : config.entrySet()) {
            result.put(entry.getKey(), renderValue(entry.getValue(), payload));
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private Object renderValue(Object value, Map<String, Object> payload) {
        if (value instanceof String s) {
            return renderString(s, payload);
        }
        if (value instanceof Map<?, ?> m) {
            return renderMap((Map<String, Object>) m, payload);
        }
        if (value instanceof List<?> list) {
            return list.stream().map(v -> renderValue(v, payload)).toList();
        }
        return value;
    }

    private String renderString(String template, Map<String, Object> payload) {
        Matcher matcher = PLACEHOLDER.matcher(template);
        StringBuilder sb = new StringBuilder();
        while (matcher.find()) {
            Object resolved = resolve(matcher.group(1), payload);
            matcher.appendReplacement(sb, Matcher.quoteReplacement(resolved != null ? resolved.toString() : ""));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private Object resolve(String dottedKey, Map<String, Object> payload) {
        Object current = payload;
        for (String part : dottedKey.split("\\.")) {
            if (!(current instanceof Map)) return null;
            current = ((Map<String, Object>) current).get(part);
        }
        return current;
    }
}
