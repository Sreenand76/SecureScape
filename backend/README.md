# SecureScape Backend

Spring Boot 3 backend for the SecureScape educational web security platform.

## Features

- **SQL Injection Demo**: Vulnerable and secure implementations
- **XSS Demo**: Vulnerable and secure comment system
- **CSRF Demo**: Vulnerable and secure transfer functionality
- **PostgreSQL (Neon)**: Cloud PostgreSQL database with SSL
- **Session Management**: CSRF token generation and validation
- **CORS Support**: Configured for frontend integration

## Tech Stack

- **Spring Boot 3.2.0**: Framework
- **Java 17**: Programming language
- **Maven**: Build tool
- **Spring Data JPA**: Database access
- **PostgreSQL (Neon)**: Cloud PostgreSQL database
- **Hibernate**: ORM

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+

### Installation

```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will be available at `http://localhost:5000`

## API Endpoints

### SQL Injection

**Attack Mode (Vulnerable):**
- `POST /api/attack/sql/login` - Vulnerable login (string concatenation)
- `GET /api/attack/sql/search?q=<query>` - Vulnerable search (string concatenation)

**Secure Mode:**
- `POST /api/secure/sql/login` - Secure login (parameterized queries)
- `GET /api/secure/sql/search?q=<query>` - Secure search (parameterized queries)

### XSS (Cross-Site Scripting)

**Attack Mode (Vulnerable):**
- `GET /api/attack/xss/comments` - Get comments (no encoding)
- `POST /api/attack/xss/comment` - Add comment (no sanitization)

**Secure Mode:**
- `GET /api/secure/xss/comments` - Get comments (HTML encoded)
- `POST /api/secure/xss/comment` - Add comment (HTML encoded)

### CSRF (Cross-Site Request Forgery)

**Attack Mode (Vulnerable):**
- `GET /api/attack/csrf/form` - Get form (no CSRF token)
- `POST /api/attack/csrf/transfer` - Transfer (no token validation)

**Secure Mode:**
- `GET /api/secure/csrf/form` - Get form with CSRF token
- `POST /api/secure/csrf/transfer` - Transfer with CSRF token validation

## Database

The application uses **Neon PostgreSQL** (cloud PostgreSQL). 

### Configuration

Configure your Neon PostgreSQL connection in `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://ep-xxx-xxx.us-east-2.aws.neon.tech/securescape?sslmode=require
    username: your-username
    password: your-password
```

Or use environment variables:
```bash
export DATABASE_URL="jdbc:postgresql://ep-xxx-xxx.us-east-2.aws.neon.tech/securescape?sslmode=require"
export DATABASE_USERNAME="your-username"
export DATABASE_PASSWORD="your-password"
```

See `POSTGRESQL_MIGRATION.md` for detailed setup instructions.

**Sample Data:**
- **Users**: admin/admin123, user1/password123, john/john123
- **Products**: Laptop, Mouse, Keyboard, Monitor, Webcam
- **Comments**: Sample comments for XSS demonstration

## Security Notes

⚠️ **IMPORTANT**: This is an educational platform. The "attack" endpoints are intentionally vulnerable for demonstration purposes. They should:
- Only be used in a controlled, isolated environment
- Never be deployed to production
- Only be used for educational purposes

## Project Structure

```
src/main/java/com/securescape/
├── config/              # Configuration classes
├── controller/          # REST controllers
│   ├── Attack*Controller.java  # Vulnerable endpoints
│   └── Secure*Controller.java   # Secure endpoints
├── dto/                 # Data Transfer Objects
├── model/               # Entity models
├── repository/          # JPA repositories
└── service/             # Business logic services
```

## Development

### Building

```bash
mvn clean package
```

### Running Tests

```bash
mvn test
```

### Database Reset

The database schema is managed by Hibernate (`ddl-auto=update`). To reset:
1. Drop and recreate the database in Neon dashboard, or
2. Change `ddl-auto` to `create-drop` (⚠️ deletes all data)

## CORS Configuration

CORS is configured to allow requests from `http://localhost:3000` (frontend). To change this, update `application.yml`:

```yaml
spring:
  web:
    cors:
      allowed-origins: http://localhost:3000
```

## License

Academic project - for educational purposes only.
