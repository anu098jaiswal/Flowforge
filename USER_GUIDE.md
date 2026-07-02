# FlowForge User Guide

## Getting Started

FlowForge is a workflow automation platform that lets you connect different services and automate tasks. Think of it as your own Zapier - you can create workflows that trigger actions based on events.

### First Steps

1. **Create an Account**
   - Click "Sign up" on the login screen
   - Enter your username, email, and password
   - After registration, log in with your credentials

2. **Navigate the Interface**
   - **Sidebar**: Access quick start templates, create new workflows, and manage existing ones
   - **Canvas**: Visual workflow builder where you design your automation
   - **Config Panel**: Configure triggers and actions for each step

## Creating Your First Workflow

### Option 1: Use a Quick Start Template

The fastest way to get started is using one of our pre-built templates:

1. Click on any template in the sidebar (e.g., "Big Order Alert", "Stripe Payment")
2. The workflow builder opens with pre-configured settings
3. Customize the fields as needed
4. Click "Create workflow" to save

### Option 2: Build from Scratch

1. Click "New workflow" in the sidebar
2. Give your workflow a name
3. Configure the trigger (see below)
4. Add actions (see below)
5. Save your workflow

## Understanding Triggers

A trigger is what starts your workflow. FlowForge supports three types:

### 1. Webhook Trigger
- **Best for**: External systems calling your workflow
- **How it works**: When an external service sends data to your webhook URL, the workflow runs
- **Use cases**: 
  - E-commerce platforms sending order data
  - Payment gateways sending payment confirmations
  - Custom integrations

**To use**:
1. Select "Webhook" as trigger type
2. Optionally add a condition (e.g., only run if amount > 1000)
3. Save the workflow
4. Use the provided webhook URL in your external system

### 2. Schedule Trigger
- **Best for**: Recurring tasks
- **How it works**: Runs automatically on a schedule using cron expressions
- **Use cases**:
  - Daily reports
  - Weekly backups
  - Monthly summaries

**To use**:
1. Select "Schedule" as trigger type
2. Enter a cron expression (e.g., `0 0 9 * * ?` for daily at 9 AM)
3. Configure your actions
4. Save the workflow

**Cron Format**: `Seconds Minutes Hours Day Month Weekday`
- `0 0 9 * * ?` = Every day at 9:00 AM
- `0 0/30 * * * ?` = Every 30 minutes
- `0 0 9 ? * MON-FRI` = Weekdays at 9:00 AM

### 3. Email Trigger
- **Best for**: Email-based automation
- **How it works**: Triggers when new emails arrive in your inbox
- **Use cases**:
  - Auto-reply to customer emails
  - Process email attachments
  - Forward emails based on content

**To use**:
1. Select "New Email" as trigger type
2. Configure email polling in application.properties
3. Set up your actions
4. Save the workflow

## Understanding Actions

Actions are what happen when your workflow triggers. FlowForge supports several action types:

### 1. Send Email
- **Purpose**: Send emails to specified recipients
- **Configuration**:
  - **To**: Comma-separated email addresses
  - **Subject**: Email subject line
  - **Body**: Email content
- **Dynamic Fields**: Use `{{fieldName}}` to insert data from the trigger payload
  - Example: `Order #{{orderId}} — amount ₹{{amount}}`

### 2. Call API / Slack
- **Purpose**: Make HTTP requests to external APIs
- **Configuration**:
  - **URL**: The API endpoint (Slack webhooks work here too)
  - **Method**: GET or POST
  - **Body**: JSON payload to send
- **Use cases**:
  - Post to Slack channels
  - Call external APIs
  - Send data to webhooks

### 3. Save to Database
- **Purpose**: Store trigger data in your database
- **Configuration**: No configuration needed
- **How it works**: Automatically saves the full trigger payload as JSON to the `dynamic_records` table

### 4. Stripe Payment
- **Purpose**: Process payments via Stripe
- **Configuration**:
  - **Amount**: Payment amount in decimal (e.g., 49.99 for $49.99)
  - **Currency**: Currency code (default: usd)
  - **Description**: Payment description
- **Requirements**: 
  - Stripe API key configured in application.properties
  - Valid Stripe account

## Working with Conditions

Conditions let you control when your workflow runs:

- **Syntax**: Spring Expression Language (SpEL)
- **Examples**:
  - `#payload['amount'] > 1000` - Only run if amount exceeds 1000
  - `#payload['status'] == 'completed'` - Only run for completed orders
  - `#payload['priority'] == 'urgent'` - Only run for urgent items

Leave the condition blank to always run the workflow.

## Testing Your Workflows

### Manual Testing

1. Go to "My workflows" in the sidebar
2. Find your workflow and click the play button
3. Enter test payload (JSON format)
4. Click "Fire webhook"
5. View execution logs to see results

### Example Test Payloads

**For order workflows**:
```json
{
  "amount": 1500,
  "orderId": "ORD-123",
  "customer": "John Doe"
}
```

**For Stripe payments**:
```json
{
  "amount": 49.99,
  "orderId": "ORD-456",
  "currency": "usd"
}
```

**For incident alerts**:
```json
{
  "service": "payments-api",
  "status": "down",
  "severity": "critical"
}
```

## Managing Workflows

### View All Workflows
- Click "My workflows" in the sidebar
- See all your workflows with their triggers and action chains

### Edit a Workflow
- Currently, edit the workflow by creating a new one based on it
- Future updates will include direct editing

### Delete a Workflow
- Click the trash icon on any workflow card
- Confirm deletion to remove the workflow and all its history

### View Execution Logs
- Expand a workflow card
- Click the play button to test
- View execution status and any error messages

## Quick Start Templates Explained

### 🛒 Big Order Alert
- **Trigger**: Webhook
- **Condition**: Amount > ₹1000
- **Action**: Send email to ops team
- **Use Case**: Alert your team about large orders

### 🚨 Incident → Slack
- **Trigger**: Webhook
- **Action**: Post to Slack webhook
- **Use Case**: Notify your team about system incidents

### 📋 Lead Capture
- **Trigger**: Webhook
- **Actions**: Save to DB + Email sales
- **Use Case**: Capture leads and notify sales team

### 📅 Daily Ops Digest
- **Trigger**: Schedule (daily at 9 AM)
- **Action**: Send summary email
- **Use Case**: Daily operational reports

### 📨 Auto-Reply Bot
- **Trigger**: New Email
- **Action**: Send auto-reply
- **Use Case**: Automatic email responses

### 💳 Stripe Payment
- **Trigger**: Webhook
- **Condition**: Amount > 0
- **Action**: Process Stripe payment
- **Use Case**: Automate payment processing

## Tips and Best Practices

1. **Start Simple**: Begin with basic workflows before adding complexity
2. **Test Thoroughly**: Always test with sample data before going live
3. **Use Conditions**: Add conditions to filter when workflows run
4. **Chain Actions**: Multiple actions run in sequence for complex workflows
5. **Monitor Logs**: Check execution logs to troubleshoot issues
6. **Secure Your Keys**: Never commit API keys to version control
7. **Use Dynamic Fields**: Leverage `{{fieldName}}` for personalized messages

## Troubleshooting

### Workflow Not Triggering
- Check if the trigger type is correctly configured
- Verify webhook URL is correct (for webhook triggers)
- Ensure conditions are not filtering out your data

### Actions Failing
- Check execution logs for error messages
- Verify API keys are configured correctly
- Ensure external services are accessible

### Authentication Issues
- Verify your username and password
- Check that you're logged in
- Clear browser cache if needed

## Security Notes

- All workflows require authentication
- JWT tokens are used for secure API access
- API keys should be stored in environment variables
- Never share your webhook URLs publicly

## Getting Help

If you encounter issues:
1. Check the execution logs for error messages
2. Verify your configuration settings
3. Ensure all required services are running
4. Review this guide for relevant sections

## Next Steps

- Explore different trigger types
- Experiment with action chaining
- Integrate with your favorite services
- Build complex multi-step workflows
