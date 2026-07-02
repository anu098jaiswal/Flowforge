package com.example.flowforge.action;
import com.example.flowforge.entity.ActionType;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ActionExecutor {

    private final Map<ActionType, Action> actionsByType;

    public ActionExecutor(List<Action> actions) {
        this.actionsByType = actions.stream()
                .collect(Collectors.toMap(Action::getType, a -> a));
    }

    public ActionResult run(ActionType type, Map<String, Object> config, Map<String, Object> payload) throws Exception {
        Action action = actionsByType.get(type);
        if (action == null) {
            return ActionResult.failed("No handler registered for action type: " + type);
        }
        return action.execute(new ActionContext(config, payload));
    }
}
