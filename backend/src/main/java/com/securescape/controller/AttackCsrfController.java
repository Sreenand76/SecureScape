package com.securescape.controller;

import com.securescape.dto.CsrfFormResponse;
import com.securescape.dto.TransferRequest;
import com.securescape.service.CsrfTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/attack/csrf")
@CrossOrigin(origins = "*", allowCredentials = "true") // Allow all origins for CSRF attack simulation
public class AttackCsrfController {
    
    @Autowired
    private CsrfTokenService csrfTokenService;
    
    // VULNERABLE: No CSRF token validation
    @GetMapping("/form")
    public ResponseEntity<?> getForm(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Form loaded (no CSRF protection - vulnerable)");
        response.put("csrfToken", null);
        response.put("warning", "This endpoint is vulnerable to CSRF attacks");
        return ResponseEntity.ok(response);
    }
    
    // VULNERABLE: No CSRF token validation
    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody TransferRequest request, HttpSession session, HttpServletRequest httpRequest) {
        try {
            // VULNERABLE CODE: No CSRF token validation
            // Any request from any origin will be processed
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Transfer completed (VULNERABLE - no CSRF protection)");
            response.put("to", request.getTo());
            response.put("amount", request.getAmount());
            response.put("warning", "This transfer was processed without CSRF token validation!");
            
            // Log the origin for demonstration
            String origin = httpRequest.getHeader("Origin");
            String referer = httpRequest.getHeader("Referer");
            response.put("requestOrigin", origin);
            response.put("requestReferer", referer);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Transfer failed: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
    
    // VULNERABLE: GET endpoint for CSRF via image tag
    @GetMapping("/transfer")
    public ResponseEntity<?> transferGet(@RequestParam String to, @RequestParam Double amount, HttpSession session, HttpServletRequest httpRequest) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Transfer completed via GET (VULNERABLE - no CSRF protection)");
            response.put("to", to);
            response.put("amount", amount);
            response.put("warning", "GET requests should never perform state-changing operations!");
            response.put("requestOrigin", httpRequest.getHeader("Origin"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Transfer failed: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
    
    // VULNERABLE: Returns session information for CSRF attack site
    @GetMapping("/session-info")
    public ResponseEntity<?> getSessionInfo(HttpSession session, HttpServletRequest request) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", session.getId());
            response.put("sessionCreationTime", session.getCreationTime());
            response.put("lastAccessedTime", session.getLastAccessedTime());
            
            // Get cookies
            Cookie[] cookies = request.getCookies();
            Map<String, String> cookieMap = new HashMap<>();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    cookieMap.put(cookie.getName(), cookie.getValue());
                }
            }
            response.put("cookies", cookieMap);
            
            // Get user agent and other headers
            response.put("userAgent", request.getHeader("User-Agent"));
            response.put("remoteAddr", request.getRemoteAddr());
            response.put("origin", request.getHeader("Origin"));
            response.put("referer", request.getHeader("Referer"));
            
            response.put("warning", "VULNERABLE: Session information exposed - can be stolen by CSRF attack site");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get session info: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
    
    // VULNERABLE: Get user profile (simulates accessing user data)
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpSession session) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", session.getId());
            response.put("username", "demo_user");
            response.put("email", "user@example.com");
            response.put("balance", 10000.00);
            response.put("warning", "VULNERABLE: User data accessible without proper authentication checks");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get profile: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
}
