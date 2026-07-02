package com.example.flowforge.condition;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;
import java.util.Map;
@Component
public class ConditionEvaluator {

    private final ExpressionParser parser = new SpelExpressionParser();

    public boolean evaluate(String expression, Map<String, Object> payload) {
        if (expression == null || expression.isBlank()) {
            return true; // no condition set -> always proceed
        }
        StandardEvaluationContext context = new StandardEvaluationContext();
        context.setVariable("payload", payload);
        Expression exp = parser.parseExpression(expression);
        Boolean result = exp.getValue(context, Boolean.class);
        return Boolean.TRUE.equals(result);
    }
}
