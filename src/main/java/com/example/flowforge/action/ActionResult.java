package com.example.flowforge.action;

public class ActionResult {

    //to report back
    private final boolean success;
    private final String message;

    private ActionResult( boolean success,String message){
        this.success=success;
        this.message=message;

    }
    public static ActionResult ok(String message) {
        return new ActionResult(true, message);
    }

    public static ActionResult failed(String message) {
        return new ActionResult(false, message);
    }
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }




}
