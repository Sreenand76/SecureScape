# ECHELON – Web Security Testing Lab

ECHELON is a full-stack web security testing platform designed to simulate real-world OWASP Top 10 vulnerabilities in a safe and controlled environment. The project helps developers and security enthusiasts understand how common web vulnerabilities occur, how they can be exploited, and how secure implementations mitigate those risks.

Built using Spring Boot, React, MySQL, and Docker, ECHELON provides both vulnerable and secure application flows for hands-on security analysis and learning.

---

## 🚀 Features

- Simulates multiple OWASP Top 10 vulnerabilities
- Toggle between vulnerable and secure implementations
- Session-based authentication system
- RESTful API architecture
- Dockerized deployment setup
- Deployed frontend and backend architecture

---

## 🔐 Implemented Security Scenarios

### Vulnerable Flows
- SQL Injection (SQLi)
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Broken Authentication
- Weak Session Management

### Secure Flows
- Parameterized queries
- Session rotation
- Input validation and sanitization
- Generic authentication error handling

---

## 🛠️ Tech Stack

### Frontend
- React
- Axios

### Backend
- Spring Boot
- Spring Data JPA
- REST APIs

### Database
- MySQL

### DevOps & Deployment
- Docker
- Render
- Vercel

### Security & Testing
- OWASP Top 10
- Postman

---

## 📂 Project Structure

```bash
Echelon/
│
├── backend/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

## 📂 Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Sreenand76/Echelon.git
```

### 2. Setup the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Setup the Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

---
