import { useState, useEffect } from "react";
import {
  getWorkflows,
  deleteWorkflow,
  fireWebhook,
  getLogs,
  createWorkflow,
  login,
  register,
} from "./api";
import "./App.css";

// ─── tiny icon set (inline SVG paths, no dep) ───────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);
const ICONS = {
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  slack:
    "M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z",
  db: "M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4z M2 12c0 2.21 4.48 4 10 4s10-1.79 10-4 M2 6c0 2.21 4.48 4 10 4s10-1.79 10-4",
  webhook:
    "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z",
  clock:
    "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2",
  plus: "M12 5v14M5 12h14",
  trash: "M3 6h18M19 6l-1 14H6L5 6M8 6V4h8v2",
  play: "M5 3l14 9-14 9V3z",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  chevron: "M6 9l6 6 6-6",
  arrow: "M5 12h14M12 5l7 7-7 7",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  info: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 16v-5 M12 8h.01",
  stripe:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z",
};

// ─── constants ───────────────────────────────────────────────────────────────
const TRIGGER_META = {
  WEBHOOK: {
    label: "Webhook",
    icon: "webhook",
    color: "#6366f1",
    desc: "Fires when an external system calls your URL",
  },
  SCHEDULE: {
    label: "Schedule",
    icon: "clock",
    color: "#f59e0b",
    desc: "Runs automatically on a cron schedule",
  },
  EMAIL: {
    label: "New Email",
    icon: "mail",
    color: "#10b981",
    desc: "Fires when a new email arrives in your inbox",
  },
};
const ACTION_META = {
  EMAIL: { label: "Send Email", icon: "mail", color: "#6366f1" },
  API_CALL: { label: "Call API / Slack", icon: "webhook", color: "#f59e0b" },
  DB_WRITE: { label: "Save to Database", icon: "db", color: "#10b981" },
  STRIPE_PAYMENT: { label: "Stripe Payment", icon: "stripe", color: "#635bff" },
};

// ─── usecases - the 5 features shown in sidebar ──────────────────────────────
const USECASES = [
  {
    id: "order-alert",
    emoji: "🛒",
    name: "Big Order Alert",
    desc: "Email ops when order amount is over ₹1000",
    workflow: {
      name: "Big order alert",
      triggerType: "WEBHOOK",
      conditionExpression: "#payload['amount'] > 1000",
      active: true,
      actions: [
        {
          actionType: "EMAIL",
          orderIndex: 1,
          configJson: JSON.stringify({
            to: "",
            subject: "Big order received",
            body: "Order #{{orderId}} — amount ₹{{amount}}",
          }),
        },
      ],
    },
    testPayload: '{"amount": 1500, "orderId": "ORD-123"}',
  },
  {
    id: "incident-slack",
    emoji: "🚨",
    name: "Incident → Slack",
    desc: "Post to Slack when a monitoring webhook fires",
    workflow: {
      name: "Incident Slack alert",
      triggerType: "WEBHOOK",
      active: true,
      actions: [
        {
          actionType: "API_CALL",
          orderIndex: 1,
          configJson: JSON.stringify({
            url: "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
            method: "POST",
            body: JSON.stringify({
              text: "🚨 Incident: {{service}} is {{status}}",
            }),
          }),
        },
      ],
    },
    testPayload: '{"service": "payments-api", "status": "down"}',
  },
  {
    id: "lead-capture",
    emoji: "📋",
    name: "Lead Capture",
    desc: "Save lead to DB then email sales — two chained actions",
    workflow: {
      name: "Lead capture + notify",
      triggerType: "WEBHOOK",
      active: true,
      actions: [
        { actionType: "DB_WRITE", orderIndex: 1, configJson: "{}" },
        {
          actionType: "EMAIL",
          orderIndex: 2,
          configJson: JSON.stringify({
            to: "",
            subject: "New lead: {{name}}",
            body: "Name: {{name}}\nEmail: {{email}}\nCompany: {{company}}",
          }),
        },
      ],
    },
    testPayload:
      '{"name": "Priya Shah", "email": "priya@corp.com", "company": "CorpX"}',
  },
  {
    id: "daily-digest",
    emoji: "📅",
    name: "Daily Ops Digest",
    desc: "Every day at 9am — email a summary (Quartz scheduler)",
    workflow: {
      name: "Daily ops digest",
      triggerType: "SCHEDULE",
      cronExpression: "0 0 9 * * ?",
      active: true,
      actions: [
        {
          actionType: "EMAIL",
          orderIndex: 1,
          configJson: JSON.stringify({
            to: "",
            subject: "Daily ops digest",
            body: "Good morning! Here is today's operations summary.",
          }),
        },
      ],
    },
    testPayload: '{"source": "scheduler", "firedAt": "2026-07-02T09:00:00Z"}',
  },
  {
    id: "auto-reply",
    emoji: "📨",
    name: "Auto-Reply Bot",
    desc: "Reply automatically when a new email lands in your inbox",
    workflow: {
      name: "Inbox auto-reply",
      triggerType: "EMAIL",
      active: true,
      actions: [
        {
          actionType: "EMAIL",
          orderIndex: 1,
          configJson: JSON.stringify({
            to: "{{from}}",
            subject: "Re: {{subject}}",
            body: "Thanks for reaching out — I'll get back to you shortly!",
          }),
        },
      ],
    },
    testPayload: '{"from": "sender@example.com", "subject": "Hello there"}',
  },
  {
    id: "stripe-payment",
    emoji: "💳",
    name: "Stripe Payment",
    desc: "Process Stripe payment when order webhook fires",
    workflow: {
      name: "Stripe payment processing",
      triggerType: "WEBHOOK",
      conditionExpression: "#payload['amount'] > 0",
      active: true,
      actions: [
        {
          actionType: "STRIPE_PAYMENT",
          orderIndex: 1,
          configJson: JSON.stringify({
            amount: "{{amount}}",
            currency: "usd",
            description: "Payment for order {{orderId}}",
          }),
        },
      ],
    },
    testPayload: '{"amount": 49.99, "orderId": "ORD-456"}',
  },
];

// ─── FlowNode: one step card on the canvas ───────────────────────────────────
function FlowNode({
  type,
  meta,
  label,
  sublabel,
  index,
  isActive,
  onClick,
  isLast,
}) {
  return (
    <div className="flow-node-wrap">
      <div
        className={`flow-node ${isActive ? "flow-node--active" : ""}`}
        onClick={onClick}
        style={{ "--node-color": meta.color }}
      >
        <div
          className="flow-node-icon"
          style={{
            background: meta.color + "22",
            border: `1px solid ${meta.color}44`,
          }}
        >
          <Icon d={ICONS[meta.icon]} size={18} color={meta.color} />
        </div>
        <div className="flow-node-text">
          <span className="flow-node-label">{label}</span>
          {sublabel && <span className="flow-node-sub">{sublabel}</span>}
        </div>
        <span className="flow-node-badge">{index}</span>
      </div>
      {!isLast && (
        <div className="flow-connector">
          <div className="flow-connector-line" />
          <Icon d={ICONS.chevron} size={14} color="#4b4b5a" />
        </div>
      )}
    </div>
  );
}

// ─── Sidebar panels ──────────────────────────────────────────────────────────
function TriggerPanel({ data, onChange }) {
  return (
    <div className="panel-section">
      <div className="panel-label">Trigger type</div>
      <div className="trigger-grid">
        {Object.entries(TRIGGER_META).map(([key, m]) => (
          <button
            key={key}
            className={`trigger-card ${data.triggerType === key ? "trigger-card--active" : ""}`}
            onClick={() => onChange({ ...data, triggerType: key })}
            style={{ "--tc": m.color }}
          >
            <Icon
              d={ICONS[m.icon]}
              size={20}
              color={data.triggerType === key ? m.color : "#6b6b80"}
            />
            <span>{m.label}</span>
          </button>
        ))}
      </div>
      {data.triggerType === "SCHEDULE" && (
        <>
          <div className="panel-label" style={{ marginTop: 14 }}>
            Cron expression
          </div>
          <input
            className="panel-input mono"
            value={data.cronExpression || ""}
            placeholder="0 0 9 * * ? (every day at 9am)"
            onChange={(e) =>
              onChange({ ...data, cronExpression: e.target.value })
            }
          />
          <div className="panel-hint">
            Standard Quartz cron format. Second · Minute · Hour · Day · Month ·
            Weekday
          </div>
        </>
      )}
      <div className="panel-label" style={{ marginTop: 14 }}>
        Condition <span className="panel-optional">(optional)</span>
      </div>
      <input
        className="panel-input mono"
        value={data.conditionExpression || ""}
        placeholder="#payload['amount'] > 1000"
        onChange={(e) =>
          onChange({ ...data, conditionExpression: e.target.value })
        }
      />
      <div className="panel-hint">
        Leave blank to always run. Uses Spring Expression Language.
      </div>
    </div>
  );
}

function ActionPanel({ action, index, onChange, onRemove }) {
  function setField(field, value) {
    const fields = JSON.parse(action.configJson || "{}");
    fields[field] = value;
    onChange(index, { ...action, configJson: JSON.stringify(fields) });
  }
  const fields = (() => {
    try {
      return JSON.parse(action.configJson || "{}");
    } catch {
      return {};
    }
  })();

  return (
    <div className="panel-section">
      <div className="panel-row-space">
        <div className="panel-label">Action {index + 1}</div>
        <button
          className="icon-btn"
          onClick={() => onRemove(index)}
          title="Remove"
        >
          <Icon d={ICONS.trash} size={14} color="#ef4444" />
        </button>
      </div>
      <select
        className="panel-input"
        value={action.actionType}
        onChange={(e) =>
          onChange(index, {
            ...action,
            actionType: e.target.value,
            configJson: "{}",
          })
        }
      >
        {Object.entries(ACTION_META).map(([k, m]) => (
          <option key={k} value={k}>
            {m.label}
          </option>
        ))}
      </select>

      {action.actionType === "EMAIL" && (
        <>
          <div className="panel-label" style={{ marginTop: 10 }}>
            To <span className="panel-optional">(comma-separated)</span>
          </div>
          <input
            className="panel-input"
            value={fields.to || ""}
            placeholder="ops@company.com, you@gmail.com"
            onChange={(e) => setField("to", e.target.value)}
          />
          <div className="panel-label" style={{ marginTop: 8 }}>
            Subject
          </div>
          <input
            className="panel-input"
            value={fields.subject || ""}
            placeholder="Alert: {{subject}}"
            onChange={(e) => setField("subject", e.target.value)}
          />
          <div className="panel-label" style={{ marginTop: 8 }}>
            Body
          </div>
          <textarea
            className="panel-input"
            rows={3}
            value={fields.body || ""}
            placeholder="Amount was {{amount}}"
            onChange={(e) => setField("body", e.target.value)}
          />
          <div className="panel-hint">
            Use {"{{fieldName}}"} to insert values from the trigger payload.
          </div>
        </>
      )}
      {action.actionType === "API_CALL" && (
        <>
          <div className="panel-label" style={{ marginTop: 10 }}>
            URL{" "}
            <span className="panel-optional">
              (Slack webhook URL works here too)
            </span>
          </div>
          <input
            className="panel-input"
            value={fields.url || ""}
            placeholder="https://hooks.slack.com/..."
            onChange={(e) => setField("url", e.target.value)}
          />
          <div className="panel-label" style={{ marginTop: 8 }}>
            Method
          </div>
          <select
            className="panel-input"
            value={fields.method || "POST"}
            onChange={(e) => setField("method", e.target.value)}
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>
          <div className="panel-label" style={{ marginTop: 8 }}>
            Body (JSON)
          </div>
          <textarea
            className="panel-input mono"
            rows={3}
            value={fields.body || ""}
            placeholder={'{"text": "Alert: {{service}} is {{status}}"}'}
            onChange={(e) => setField("body", e.target.value)}
          />
        </>
      )}
      {action.actionType === "DB_WRITE" && (
        <div className="panel-hint" style={{ marginTop: 10 }}>
          Writes the full trigger payload as JSON into the{" "}
          <code>dynamic_records</code> table. No config needed.
        </div>
      )}
      {action.actionType === "STRIPE_PAYMENT" && (
        <>
          <div className="panel-label" style={{ marginTop: 10 }}>
            Amount
          </div>
          <input
            className="panel-input"
            value={fields.amount || ""}
            placeholder="49.99"
            onChange={(e) => setField("amount", e.target.value)}
          />
          <div className="panel-label" style={{ marginTop: 8 }}>
            Currency
          </div>
          <input
            className="panel-input"
            value={fields.currency || "usd"}
            placeholder="usd"
            onChange={(e) => setField("currency", e.target.value)}
          />
          <div className="panel-label" style={{ marginTop: 8 }}>
            Description
          </div>
          <input
            className="panel-input"
            value={fields.description || ""}
            placeholder="Payment for order {{orderId}}"
            onChange={(e) => setField("description", e.target.value)}
          />
          <div className="panel-hint">
            Use {"{{fieldName}}"} to insert values from the trigger payload.
            Amount should be in decimal (e.g., 49.99 for $49.99).
          </div>
        </>
      )}
    </div>
  );
}

// ─── Builder view (Zapier-style canvas) ─────────────────────────────────────
const EMPTY_ACTION = () => ({
  actionType: "EMAIL",
  orderIndex: 1,
  configJson: "{}",
});

function Builder({ prefill, onSaved }) {
  const [draft, setDraft] = useState(
    prefill || {
      name: "",
      triggerType: "WEBHOOK",
      conditionExpression: "",
      cronExpression: "",
      active: true,
      actions: [EMPTY_ACTION()],
    },
  );
  const [activeNode, setActiveNode] = useState("trigger"); // "trigger" | 0 | 1 | 2...
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (prefill) {
      setDraft(prefill);
      setActiveNode("trigger");
      setSaved(false);
    }
  }, [prefill]);

  function addAction() {
    const a = { ...EMPTY_ACTION(), orderIndex: draft.actions.length + 1 };
    setDraft((d) => ({ ...d, actions: [...d.actions, a] }));
    setActiveNode(draft.actions.length);
  }

  function updateAction(i, updated) {
    setDraft((d) => ({
      ...d,
      actions: d.actions.map((a, idx) => (idx === i ? updated : a)),
    }));
  }

  function removeAction(i) {
    setDraft((d) => ({
      ...d,
      actions: d.actions
        .filter((_, idx) => idx !== i)
        .map((a, idx) => ({ ...a, orderIndex: idx + 1 })),
    }));
    setActiveNode("trigger");
  }

  async function save() {
    if (!draft.name.trim()) {
      setError("Give this workflow a name.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createWorkflow(draft);
      setSaved(true);
      setTimeout(() => {
        onSaved();
        setSaved(false);
      }, 900);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const tm = TRIGGER_META[draft.triggerType];

  return (
    <div className="builder">
      {/* canvas */}
      <div className="canvas">
        <div className="canvas-inner">
          <input
            className="workflow-name-input"
            value={draft.name}
            placeholder="Name this workflow…"
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />

          <FlowNode
            type="trigger"
            meta={tm}
            label={tm.label}
            index="T"
            sublabel={draft.conditionExpression || tm.desc}
            isActive={activeNode === "trigger"}
            onClick={() => setActiveNode("trigger")}
            isLast={false}
          />

          {draft.actions.map((a, i) => {
            const am = ACTION_META[a.actionType];
            return (
              <FlowNode
                key={i}
                type="action"
                meta={am}
                label={am.label}
                index={i + 1}
                sublabel={(() => {
                  try {
                    const f = JSON.parse(a.configJson);
                    return f.to || f.url || f.subject || "";
                  } catch {
                    return "";
                  }
                })()}
                isActive={activeNode === i}
                onClick={() => setActiveNode(i)}
                isLast={i === draft.actions.length - 1}
              />
            );
          })}

          <button className="add-step-btn" onClick={addAction}>
            <Icon d={ICONS.plus} size={16} color="#6366f1" /> Add action
          </button>

          {error && <div className="canvas-error">{error}</div>}

          <button
            className={`save-btn ${saved ? "save-btn--ok" : ""}`}
            onClick={save}
            disabled={saving || saved}
          >
            {saved ? (
              <>
                <Icon d={ICONS.check} size={16} /> Saved!
              </>
            ) : saving ? (
              "Saving…"
            ) : (
              "Create workflow"
            )}
          </button>
        </div>
      </div>

      {/* config sidebar */}
      <div className="config-panel">
        <div className="config-panel-title">
          {activeNode === "trigger"
            ? "Configure trigger"
            : `Configure step ${activeNode + 1}`}
        </div>
        {activeNode === "trigger" ? (
          <TriggerPanel data={draft} onChange={setDraft} />
        ) : (
          <ActionPanel
            action={draft.actions[activeNode]}
            index={activeNode}
            onChange={updateAction}
            onRemove={removeAction}
          />
        )}
      </div>
    </div>
  );
}

// ─── Workflow card in the "My Workflows" list ────────────────────────────────
function WorkflowCard({ wf, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [payload, setPayload] = useState('{"amount": 1500}');
  const [log, setLog] = useState(null);
  const [firing, setFiring] = useState(false);

  async function fire() {
    setFiring(true);
    setLog(null);
    try {
      await fireWebhook(wf.id, payload);
      setTimeout(async () => {
        try {
          const logs = await getLogs(wf.id);
          setLog(logs[0] ?? null);
        } catch {}
        setFiring(false);
      }, 1400);
    } catch (e) {
      setLog({ status: "FAILED", errorMessage: e.message });
      setFiring(false);
    }
  }

  const tm = TRIGGER_META[wf.triggerType] || TRIGGER_META.WEBHOOK;

  return (
    <div className="wf-card">
      <div className="wf-card-header">
        <div className="wf-card-left">
          <div className="wf-trigger-dot" style={{ background: tm.color }} />
          <div>
            <div className="wf-name">{wf.name}</div>
            <div className="wf-meta">
              <span
                className="wf-badge"
                style={{
                  color: tm.color,
                  borderColor: tm.color + "44",
                  background: tm.color + "11",
                }}
              >
                {tm.label}
              </span>
              {wf.conditionExpression && (
                <span className="wf-condition">{wf.conditionExpression}</span>
              )}
            </div>
          </div>
        </div>
        <div className="wf-card-actions">
          <button
            className="icon-btn-sm"
            onClick={() => setExpanded((e) => !e)}
            title="Test"
          >
            <Icon d={ICONS.play} size={14} color="#6366f1" />
          </button>
          <button
            className="icon-btn-sm danger"
            onClick={() => onDelete(wf.id)}
            title="Delete"
          >
            <Icon d={ICONS.trash} size={14} color="#ef4444" />
          </button>
        </div>
      </div>

      {/* action chain pills */}
      <div className="wf-chain">
        {wf.actions.map((a, i) => {
          const am = ACTION_META[a.actionType] || ACTION_META.EMAIL;
          return (
            <div key={i} className="wf-chain-item">
              {i > 0 && <Icon d={ICONS.arrow} size={12} color="#3b3b4f" />}
              <span
                className="wf-action-pill"
                style={{
                  color: am.color,
                  borderColor: am.color + "44",
                  background: am.color + "11",
                }}
              >
                <Icon d={ICONS[am.icon]} size={11} color={am.color} />
                {am.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* test panel */}
      {expanded && (
        <div className="test-panel">
          <div className="panel-label">Test payload (JSON)</div>
          <textarea
            className="panel-input mono"
            rows={2}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
          <button className="fire-btn" onClick={fire} disabled={firing}>
            {firing ? (
              "Firing…"
            ) : (
              <>
                <Icon d={ICONS.play} size={14} /> Fire webhook
              </>
            )}
          </button>
          {log && (
            <div className={`log-row log-${log.status?.toLowerCase()}`}>
              <Icon
                d={log.status === "SUCCESS" ? ICONS.check : ICONS.x}
                size={14}
              />
              <span>
                {log.status}
                {log.errorMessage ? ` — ${log.errorMessage}` : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quick Guide — "how FlowForge works", Zapier-style walkthrough ─────────
const GUIDE_STEPS = [
  {
    n: 1,
    title: "Pick a trigger",
    desc: "Every workflow starts with something that kicks it off — an incoming webhook call, a schedule, or a new email landing in your inbox.",
    icon: "webhook",
    color: "#6366f1",
  },
  {
    n: 2,
    title: "Add a condition (optional)",
    desc: "Only run the workflow when the data matches a rule — e.g. only alert ops when an order is over ₹1000.",
    icon: "filter",
    color: "#f59e0b",
  },
  {
    n: 3,
    title: "Chain your actions",
    desc: "Add one or more actions to run in order: send an email, call an API or Slack webhook, write to your database, or charge a card with Stripe.",
    icon: "zap",
    color: "#10b981",
  },
  {
    n: 4,
    title: "Save, activate & test",
    desc: "Turn the workflow on, fire a test payload, and watch it run. Every run — success or failure — is recorded in the logs.",
    icon: "play",
    color: "#635bff",
  },
];

function GuidePage({ onStartBuilding }) {
  return (
    <div className="guide-page">
      <div className="guide-header">
        <h2>How FlowForge works</h2>
        <p>
          Every workflow in FlowForge follows the same shape: a{" "}
          <strong>trigger</strong> kicks it off, an optional{" "}
          <strong>condition</strong> decides whether it should continue, and one
          or more <strong>actions</strong> run in order — automatically, with no
          manual steps in between.
        </p>
      </div>

      <div className="guide-steps">
        {GUIDE_STEPS.map((s, i) => (
          <div className="guide-step" key={s.n}>
            <div className="guide-step-top">
              <div
                className="guide-step-icon"
                style={{ background: `${s.color}22`, color: s.color }}
              >
                <Icon d={ICONS[s.icon]} size={20} />
              </div>
              <span className="guide-step-num">Step {s.n}</span>
            </div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            {i < GUIDE_STEPS.length - 1 && (
              <div className="guide-step-arrow">
                <Icon d={ICONS.arrow} size={18} color="#3b3b4f" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="guide-section">
        <h3>Triggers</h3>
        <div className="guide-meta-grid">
          {Object.entries(TRIGGER_META).map(([key, t]) => (
            <div className="guide-meta-card" key={key}>
              <div
                className="guide-meta-icon"
                style={{ background: `${t.color}22`, color: t.color }}
              >
                <Icon d={ICONS[t.icon]} size={16} />
              </div>
              <div>
                <div className="guide-meta-name">{t.label}</div>
                <div className="guide-meta-desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="guide-section">
        <h3>Actions</h3>
        <div className="guide-meta-grid">
          {Object.entries(ACTION_META).map(([key, a]) => (
            <div className="guide-meta-card" key={key}>
              <div
                className="guide-meta-icon"
                style={{ background: `${a.color}22`, color: a.color }}
              >
                <Icon d={ICONS[a.icon]} size={16} />
              </div>
              <div>
                <div className="guide-meta-name">{a.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="guide-cta">
        <div>
          <h3>Ready to try it?</h3>
          <p>
            Pick a ready-made quick start from the sidebar, or build your own
            from scratch.
          </p>
        </div>
        <button className="new-btn" onClick={onStartBuilding}>
          <Icon d={ICONS.plus} size={15} /> Build a workflow
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar nav ─────────────────────────────────────────────────────────────
function Sidebar({ view, setView, usecasePick, setUsecasePick }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Icon d={ICONS.zap} size={16} color="#fff" />
        </div>
        <span>FlowForge</span>
      </div>

      <div className="sidebar-section-label">Create</div>
      <button
        className={`sidebar-item ${view === "builder" && !usecasePick ? "sidebar-item--active" : ""}`}
        onClick={() => {
          setView("builder");
          setUsecasePick(null);
        }}
      >
        <Icon d={ICONS.plus} size={15} /> New workflow
      </button>

      <div className="sidebar-section-label" style={{ marginTop: 20 }}>
        Quick start
      </div>
      {USECASES.map((u) => (
        <button
          key={u.id}
          className={`sidebar-item ${view === "builder" && usecasePick?.id === u.id ? "sidebar-item--active" : ""}`}
          onClick={() => {
            setView("builder");
            setUsecasePick(u);
          }}
        >
          <span style={{ fontSize: 15 }}>{u.emoji}</span>
          <div className="sidebar-item-text">
            <span className="sidebar-item-name">{u.name}</span>
            <span className="sidebar-item-desc">{u.desc}</span>
          </div>
        </button>
      ))}

      <div className="sidebar-section-label" style={{ marginTop: 20 }}>
        Manage
      </div>
      <button
        className={`sidebar-item ${view === "list" ? "sidebar-item--active" : ""}`}
        onClick={() => {
          setView("list");
          setUsecasePick(null);
        }}
      >
        <Icon d={ICONS.filter} size={15} /> My workflows
      </button>

      <div className="sidebar-section-label" style={{ marginTop: 20 }}>
        Learn
      </div>
      <button
        className={`sidebar-item ${view === "guide" ? "sidebar-item--active" : ""}`}
        onClick={() => {
          setView("guide");
          setUsecasePick(null);
        }}
      >
        <Icon d={ICONS.info} size={15} /> How it works
      </button>

      <div className="sidebar-section-label" style={{ marginTop: 20 }}>
        Account
      </div>
      <button
        className="sidebar-item"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.reload();
        }}
      >
        <Icon d={ICONS.x} size={15} /> Logout
      </button>
    </nav>
  );
}

// ─── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(username, password);
        localStorage.setItem("token", res.token);
        onAuthenticated(res.username);
      } else {
        await register(username, email, password);
        setIsLogin(true);
        setError("Registration successful! Please login.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">
            <Icon d={ICONS.zap} size={20} color="#fff" />
          </div>
          <span>FlowForge</span>
        </div>
        <h2>{isLogin ? "Welcome back" : "Create account"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          )}
          <div className="auth-field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              required
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Loading..." : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>
        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("builder");
  const [usecasePick, setUsecasePick] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [loadErr, setLoadErr] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      load();
      // Show the quick guide automatically the very first time someone
      // lands in the app, same idea as Zapier's "how it works" onboarding.
      if (!localStorage.getItem("ff_seen_guide")) {
        setView("guide");
        localStorage.setItem("ff_seen_guide", "1");
      }
    }
  }, []);

  async function load() {
    try {
      setWorkflows(await getWorkflows());
      setLoadErr(null);
    } catch (e) {
      setLoadErr(
        "Can't reach the backend — is it running, and is its URL set correctly?",
      );
    }
  }

  function handleAuthenticated(username) {
    setIsAuthenticated(true);
    setCurrentUser(username);
    load();
    if (!localStorage.getItem("ff_seen_guide")) {
      setView("guide");
      localStorage.setItem("ff_seen_guide", "1");
    }
  }

  function handleSaved() {
    load();
    setView("list");
    setUsecasePick(null);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this workflow and all its history?")) return;
    await deleteWorkflow(id);
    load();
  }

  const prefill = usecasePick
    ? { ...usecasePick.workflow, name: usecasePick.name }
    : null;

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="shell">
      <Sidebar
        view={view}
        setView={setView}
        usecasePick={usecasePick}
        setUsecasePick={setUsecasePick}
      />
      <main className="main">
        {view === "guide" && (
          <GuidePage
            onStartBuilding={() => {
              setView("builder");
              setUsecasePick(null);
            }}
          />
        )}
        {view === "builder" && (
          <>
            {usecasePick && (
              <div className="usecase-banner">
                <span style={{ fontSize: 22 }}>{usecasePick.emoji}</span>
                <div>
                  <div className="usecase-banner-name">{usecasePick.name}</div>
                  <div className="usecase-banner-desc">{usecasePick.desc}</div>
                </div>
              </div>
            )}
            <Builder prefill={prefill} onSaved={handleSaved} />
          </>
        )}
        {view === "list" && (
          <div className="list-view">
            <div className="list-header">
              <h2>My workflows</h2>
              <button
                className="new-btn"
                onClick={() => {
                  setView("builder");
                  setUsecasePick(null);
                }}
              >
                <Icon d={ICONS.plus} size={15} /> New
              </button>
            </div>
            {loadErr && <div className="load-error">{loadErr}</div>}
            {!loadErr && workflows.length === 0 && (
              <div className="empty-state">
                <Icon d={ICONS.zap} size={40} color="#3b3b4f" />
                <p>
                  No workflows yet.
                  <br />
                  Pick a quick start from the sidebar or create one from
                  scratch.
                </p>
              </div>
            )}
            <div className="wf-list">
              {workflows.map((wf) => (
                <WorkflowCard key={wf.id} wf={wf} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
