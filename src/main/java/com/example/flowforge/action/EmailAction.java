package com.example.flowforge.action;

import com.example.flowforge.entity.ActionType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailAction implements Action {

    private final JavaMailSender mailSender;

    public EmailAction(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public ActionType getType() {
        return ActionType.EMAIL;
    }

    @Override
    public ActionResult execute(ActionContext context) {
        String to = (String) context.getConfig().get("to");
        String subject = (String) context.getConfig().get("subject");
        String body = (String) context.getConfig().get("body");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);

        return ActionResult.ok("Email sent to " + to);
    }
}