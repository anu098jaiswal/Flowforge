# FlowForge

A modern workflow automation platform inspired by Zapier. Build, automate, and integrate your workflows with a beautiful dark-mode interface.

## Features

- **🎨 Modern UI**: Zapier-inspired dark mode interface with smooth animations
- **🔐 JWT Authentication**: Secure user authentication with JWT tokens
- **💳 Stripe Integration**: Built-in Stripe payment processing workflows
- **📧 Email Automation**: Send emails, process incoming emails, auto-reply
- **🔗 Webhook Triggers**: Trigger workflows from external systems
- **⏰ Scheduled Workflows**: Cron-based scheduling for recurring tasks
- **🔌 API Integration**: Call external APIs and Slack webhooks
- **💾 Database Storage**: Save workflow data to PostgreSQL
- **🚀 Quick Start Templates**: Pre-built workflow templates to get started fast

## Tech Stack

### Backend
- **Java 17** with Spring Boot 4.1.0
- **Spring Security** with JWT authentication
- **Spring Data JPA** for database operations
- **PostgreSQL** as the database
- **Quartz Scheduler** for scheduled workflows
- **Stripe Java SDK** for payment processing
- **Spring Mail** for email functionality

### Frontend
- **React 19** with Vite
- **Modern CSS** with custom dark theme
- **No external UI libraries** - pure, lightweight implementation

## Project Structure

```
flowforge-backend/
├── src/main/java/com/example/flowforge/
│   ├── action/           # Workflow action implementations
│   ├── config/          # Security and CORS configuration
│   ├── controller/      # REST API controllers
│   ├── entity/          # JPA entities (User, Workflow, etc.)
│   ├── repository/      # Data access layer
│   ├── security/        # JWT authentication utilities
│   ├── service/         # Business logic
│   └── scheduler/       # Quartz job scheduling
├── src/main/resources/
│   ├── application.properties  # Configuration
│   └── schema.sql            # Database schema
├── frontend/            # React frontend
│   ├── src/
│   │   ├── App.jsx     # Main React component
│   │   ├── App.css     # Styling
│   │   └── api.js      # API client
│   └── package.json
└── pom.xml             # Maven dependencies
```

## Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **Node.js 18+** and npm
- **PostgreSQL 12+**
- **Stripe Account** (for payment features - optional)

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE flowforge;
```

### 2. Backend Configuration

Update `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/flowforge
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password

# Email (Gmail example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Stripe (optional - for payment workflows)
stripe.api.key=sk_test_your_stripe_api_key

# JWT Secret (change in production!)
jwt.secret=your-secret-key-change-in-production
jwt.expiration=86400000
```

### 3. Install Dependencies

**Backend:**
```bash
mvn clean install
```

**Frontend:**
```bash
cd frontend
npm install
```

## Running the Application

### Start Backend

```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## Deployment

### Backend Deployment

**Build JAR:**
```bash
mvn clean package
```

**Run JAR:**
```bash
java -jar target/flowforge-0.0.1-SNAPSHOT.jar
```

**With environment variables:**
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/flowforge
export SPRING_DATASOURCE_USERNAME=your_username
export SPRING_DATASOURCE_PASSWORD=your_password
export STRIPE_API_KEY=your_stripe_key
export JWT_SECRET=your_jwt_secret

java -jar target/flowforge-0.0.1-SNAPSHOT.jar
```

### Frontend Deployment

**Build for production:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

Serve with any static file server (nginx, Apache, etc.):

**Example with nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker Deployment

**Create Dockerfile for backend:**
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/flowforge-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Create Dockerfile for frontend:**
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
# Backend
docker build -t flowforge-backend .
docker run -p 8080:8080 flowforge-backend

# Frontend
docker build -t flowforge-frontend .
docker run -p 80:80 flowforge-frontend
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/flowforge` |
| `SPRING_DATASOURCE_USERNAME` | Database username | - |
| `SPRING_DATASOURCE_PASSWORD` | Database password | - |
| `STRIPE_API_KEY` | Stripe API key | - |
| `JWT_SECRET` | JWT signing secret | `flowforge-secret-key-change-in-production` |
| `JWT_EXPIRATION` | Token expiration (ms) | `86400000` (24 hours) |
| `EMAIL_POLL_ENABLED` | Enable email polling | `false` |
| `EMAIL_POLL_INTERVAL_MS` | Email poll interval | `30000` |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Workflows
- `GET /api/workflows` - Get all workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/{id}` - Get workflow by ID
- `PUT /api/workflows/{id}` - Update workflow
- `DELETE /api/workflows/{id}` - Delete workflow
- `GET /api/workflows/{id}/logs` - Get workflow execution logs

### Webhooks
- `POST /api/webhooks/{id}` - Trigger workflow via webhook

## Quick Start Guide

1. **Start the application** (both backend and frontend)
2. **Create an account** using the registration form
3. **Choose a quick start template** from the sidebar
4. **Customize the workflow** to fit your needs
5. **Test the workflow** using the test panel
6. **Save and activate** your workflow

For detailed usage instructions, see [USER_GUIDE.md](USER_GUIDE.md)

## Workflow Templates

### Available Templates

- **🛒 Big Order Alert** - Email alerts for large orders
- **🚨 Incident → Slack** - Post incidents to Slack
- **📋 Lead Capture** - Save leads and notify sales
- **📅 Daily Ops Digest** - Scheduled daily reports
- **📨 Auto-Reply Bot** - Automatic email responses
- **💳 Stripe Payment** - Process Stripe payments

## Security Considerations

- Change the default JWT secret in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Restrict CORS origins to your domain
- Use strong database passwords
- Keep dependencies updated

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in application.properties
- Check port 8080 is not in use

### Frontend can't connect to backend
- Verify CORS configuration in WebConfig.java
- Check backend is running on port 8080
- Ensure no firewall blocking the connection

### Email not sending
- Verify email credentials are correct
- For Gmail, use an App Password (not your regular password)
- Check SMTP settings match your email provider

### Stripe payments failing
- Verify Stripe API key is valid
- Check Stripe account is in test mode for test keys
- Ensure amount is in correct format (decimal, not cents)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the [USER_GUIDE.md](USER_GUIDE.md) for detailed usage instructions
- Review the troubleshooting section above
- Check the application logs for error messages

## Acknowledgments

- Inspired by [Zapier](https://zapier.com)
- Built with [Spring Boot](https://spring.io/projects/spring-boot)
- Frontend powered by [React](https://react.dev)
- Payments via [Stripe](https://stripe.com)
