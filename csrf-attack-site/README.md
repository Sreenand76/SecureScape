# CSRF Attack Site

This is an external malicious website that demonstrates CSRF attacks in action.

## Purpose

This site is created for **educational purposes only** to demonstrate:
1. How CSRF attacks work
2. Session ID theft
3. Unauthorized actions performed using stolen sessions
4. Multiple CSRF attack vectors

## How to Use

1. **Start the main application** (backend on port 5000, frontend on port 3000)

2. **Serve this HTML file** using a simple HTTP server:
   ```bash
   # Using Python 3
   cd csrf-attack-site
   python -m http.server 8081
   
   # Using Node.js (http-server)
   npx http-server -p 8081
   
   # Using PHP
   php -S localhost:8081
   ```

3. **Access the attack site**:
   - Direct URL: `http://localhost:8081/csrf-attack.html`
   - Or click the "Open Malicious CSRF Attack Site" button in the CSRF demo page

4. **Make sure you're logged in** to the main application (or have an active session)

5. **Open the attack site** - it will automatically attempt to:
   - Steal your session ID
   - Steal your profile information
   - Perform unauthorized money transfers
   - Demonstrate various CSRF attack methods

## Attack Methods Demonstrated

1. **Session Theft**: Steals session ID and cookies via fetch API
2. **Profile Theft**: Retrieves user profile information
3. **POST CSRF**: Performs unauthorized POST request to transfer money
4. **GET CSRF**: Uses image tag to trigger GET request
5. **Form Auto-Submit**: Hidden form that auto-submits (commented out to prevent navigation)

## Security Notes

⚠️ **IMPORTANT**: 
- This is for educational/demonstration purposes only
- Only use in a controlled, isolated environment
- Never deploy to production
- The attack site shows all activity for educational transparency
- In real attacks, malicious sites hide all attack activity

## What Happens

When you visit this site while logged into the vulnerable application:

1. The page loads and automatically starts executing attacks
2. It attempts to steal your session information
3. It tries to perform unauthorized actions (money transfers)
4. All activity is logged in the attack log panel
5. If CSRF protection is disabled, the attacks will succeed
6. If CSRF protection is enabled, the attacks will be blocked

## Testing

- **Insecure Mode**: Attacks will succeed, demonstrating the vulnerability
- **Secure Mode**: Attacks will fail, demonstrating CSRF token protection
