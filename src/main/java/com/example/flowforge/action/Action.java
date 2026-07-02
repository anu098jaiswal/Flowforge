package com.example.flowforge.action;
import com.example.flowforge.entity.ActionType;

public interface Action {

    ActionType getType();
    ActionResult execute(ActionContext context) throws Exception;

}
