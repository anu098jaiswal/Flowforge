package com.example.flowforge.email;

import com.example.flowforge.entity.TriggerType;
import com.example.flowforge.entity.Workflow;
import com.example.flowforge.repository.WorkflowRepository;
import com.example.flowforge.service.WorkflowExecutionService;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.search.FlagTerm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

/**
 * Polls an IMAP inbox on a fixed interval. For every unread message it
 * finds, it fires every active workflow whose triggerType is EMAIL, passing
 * along {from, subject, body, receivedAt} as the trigger payload — the same
 * shape a webhook payload would take, so it flows through the same
 * ConditionEvaluator / TemplateRenderer / ActionExecutor pipeline.
 *
 * Disabled by default (flowforge.email-poll.enabled=false) so the app boots
 * fine with no mail credentials configured. Turn it on once MAIL_USERNAME /
 * MAIL_PASSWORD are set.
 */
@Service
public class EmailPollingService {

    private static final Logger log = LoggerFactory.getLogger(EmailPollingService.class);

    private final WorkflowRepository workflowRepository;
    private final WorkflowExecutionService workflowExecutionService;

    @Value("${flowforge.email-poll.enabled:false}")
    private boolean enabled;

    @Value("${flowforge.email-poll.imap-host:imap.gmail.com}")
    private String imapHost;

    @Value("${flowforge.email-poll.imap-port:993}")
    private int imapPort;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    public EmailPollingService(WorkflowRepository workflowRepository,
                                WorkflowExecutionService workflowExecutionService) {
        this.workflowRepository = workflowRepository;
        this.workflowExecutionService = workflowExecutionService;
    }

    @Scheduled(fixedDelayString = "${flowforge.email-poll.interval-ms:30000}")
    public void pollInbox() {
        if (!enabled) {
            return;
        }
        if (username.isBlank() || password.isBlank()) {
            log.warn("Email polling is enabled but MAIL_USERNAME/MAIL_PASSWORD are not set — skipping.");
            return;
        }

        List<Workflow> emailWorkflows = workflowRepository.findByTriggerTypeAndActiveTrue(TriggerType.EMAIL);
        if (emailWorkflows.isEmpty()) {
            return; // nothing subscribed to EMAIL triggers, don't bother connecting
        }

        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");
        props.put("mail.imaps.host", imapHost);
        props.put("mail.imaps.port", String.valueOf(imapPort));
        props.put("mail.imaps.ssl.enable", "true");
        Session session = Session.getInstance(props);

        try (Store store = session.getStore("imaps")) {
            store.connect(imapHost, imapPort, username, password);
            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_WRITE);

            Message[] unseen = inbox.search(new FlagTerm(new Flags(Flags.Flag.SEEN), false));
            for (Message message : unseen) {
                Map<String, Object> payload = toPayload(message);
                for (Workflow workflow : emailWorkflows) {
                    try {
                        workflowExecutionService.execute(workflow.getId(), payload);
                    } catch (Exception e) {
                        log.warn("Failed to execute workflow {} for incoming email: {}", workflow.getId(), e.getMessage());
                    }
                }
                message.setFlag(Flags.Flag.SEEN, true);
            }

            inbox.close(false);
        } catch (Exception e) {
            log.warn("Email polling failed: {}", e.getMessage());
        }
    }

    private Map<String, Object> toPayload(Message message) throws Exception {
        Map<String, Object> payload = new HashMap<>();
        Address[] from = message.getFrom();
        String fromAddress = (from != null && from.length > 0) ? ((InternetAddress) from[0]).getAddress() : "";
        payload.put("from", fromAddress);
        payload.put("subject", message.getSubject() == null ? "" : message.getSubject());
        payload.put("body", extractText(message));
        payload.put("receivedAt", Instant.now().toString());
        return payload;
    }

    private String extractText(Message message) throws Exception {
        Object content = message.getContent();
        if (content instanceof String s) {
            return s;
        }
        if (content instanceof Multipart mp) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < mp.getCount(); i++) {
                BodyPart part = mp.getBodyPart(i);
                if (part.isMimeType("text/plain")) {
                    sb.append(part.getContent());
                }
            }
            return sb.toString();
        }
        return "";
    }
}
