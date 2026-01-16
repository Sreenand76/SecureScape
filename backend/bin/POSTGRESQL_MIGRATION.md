# PostgreSQL Migration Guide

This document describes the migration from SQLite to Neon PostgreSQL.

## Changes Made

### 1. Maven Dependencies (`pom.xml`)
- **Removed**: SQLite JDBC driver and Hibernate community dialects
- **Added**: PostgreSQL JDBC driver (Hibernate 6 compatible)
  ```xml
  <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
  </dependency>
  ```

### 2. Configuration (`application.yml`)
- **Replaced**: `application.properties` with `application.yml`
- **Database**: Configured for Neon PostgreSQL with SSL
- **Connection Pooling**: HikariCP with production-safe defaults
- **Hibernate**: PostgreSQL dialect (Hibernate 6 compatible)

### 3. Removed Files
- `SQLiteDialect.java` - No longer needed (PostgreSQL has built-in support)
- `application.properties` - Replaced with YAML configuration

## Neon PostgreSQL Setup

### 1. Get Your Connection Details

From your Neon dashboard, you'll need:
- **Host**: `ep-xxx-xxx.us-east-2.aws.neon.tech` (your endpoint)
- **Database**: Your database name
- **Username**: Your username
- **Password**: Your password

### 2. Configure Connection

#### Option A: Environment Variables (Recommended for Production)

```bash
export DATABASE_URL="jdbc:postgresql://ep-xxx-xxx.us-east-2.aws.neon.tech/securescape?sslmode=require"
export DATABASE_USERNAME="your-username"
export DATABASE_PASSWORD="your-password"
```

#### Option B: Update `application.yml`

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://ep-xxx-xxx.us-east-2.aws.neon.tech/securescape?sslmode=require
    username: your-username
    password: your-password
```

#### Option C: Profile-Specific Configuration

Create `application-dev.yml` for development:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://ep-xxx-xxx.us-east-2.aws.neon.tech/securescape?sslmode=require
    username: dev-username
    password: dev-password
```

Run with: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`

### 3. SSL Configuration

Neon PostgreSQL requires SSL. The configuration includes:
- `sslmode=require` in the JDBC URL
- SSL is automatically handled by the PostgreSQL driver

## Hibernate 6 Compatibility

### Dialect Configuration

The configuration uses the standard PostgreSQL dialect:
```yaml
spring:
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

This is fully compatible with:
- Hibernate 6.x (used by Spring Boot 3.2.0)
- Spring Data JPA
- Spring Security (if added later)

### Key Features

- **Auto-detection**: Hibernate automatically detects PostgreSQL
- **Native SQL**: Supports PostgreSQL-specific features
- **UUID Support**: Built-in UUID type support
- **JSON Support**: PostgreSQL JSON/JSONB types
- **Full-text Search**: PostgreSQL full-text search capabilities

## Connection Pooling (HikariCP)

Production-safe defaults configured:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10        # Max connections
      minimum-idle: 5              # Min idle connections
      connection-timeout: 30000   # 30 seconds
      idle-timeout: 600000         # 10 minutes
      max-lifetime: 1800000        # 30 minutes
      leak-detection-threshold: 60000  # 1 minute
```

## Spring Security Compatibility

The configuration is ready for Spring Security integration:

1. **Session Management**: Already configured with JDBC session store
2. **Connection Pooling**: HikariCP works seamlessly with Spring Security
3. **Transaction Management**: Standard JPA transaction support
4. **No Deprecated Config**: All properties use current Spring Boot 3.x syntax

To add Spring Security later:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

The existing configuration will work without changes.

## Migration Steps

1. **Backup SQLite Data** (if needed):
   ```bash
   # Export data from SQLite
   sqlite3 securescape.db .dump > backup.sql
   ```

2. **Update Configuration**:
   - Set your Neon PostgreSQL credentials in `application.yml` or environment variables

3. **Build and Run**:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. **Verify Connection**:
   - Check logs for successful database connection
   - Verify tables are created (Hibernate will auto-create)

5. **Re-seed Data**:
   - The `DataInitializer` will automatically create sample data on first run

## Troubleshooting

### Connection Issues

**Error: "Connection refused"**
- Verify your Neon endpoint URL is correct
- Check if your IP is whitelisted in Neon dashboard
- Ensure SSL is enabled (`sslmode=require`)

**Error: "Authentication failed"**
- Verify username and password
- Check if credentials match Neon dashboard

**Error: "Database does not exist"**
- Create the database in Neon dashboard first
- Or update the database name in the connection URL

### SSL Issues

**Error: "SSL required"**
- Ensure `sslmode=require` is in the JDBC URL
- Neon PostgreSQL requires SSL connections

### Hibernate Issues

**Error: "Dialect not found"**
- Verify PostgreSQL driver is in `pom.xml`
- Check `application.yml` dialect configuration

**Tables not created**
- Check `spring.jpa.hibernate.ddl-auto=update`
- Verify database user has CREATE TABLE permissions

## Production Checklist

- [ ] Use environment variables for sensitive credentials
- [ ] Configure connection pool size based on load
- [ ] Enable connection leak detection
- [ ] Set up database backups
- [ ] Configure SSL certificates (if using custom certificates)
- [ ] Monitor connection pool metrics
- [ ] Set up database connection retry logic (if needed)

## Additional Resources

- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [PostgreSQL JDBC Driver](https://jdbc.postgresql.org/)
- [Spring Boot Data Source Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.sql.datasource)
- [Hibernate 6 Dialects](https://docs.jboss.org/hibernate/orm/6.0/userguide/html_single/Hibernate_User_Guide.html#database-dialect)
