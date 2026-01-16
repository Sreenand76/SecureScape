package com.securescape.controller;

import com.securescape.dto.CsrfFormResponse;
import com.securescape.dto.TransferRequest;
import com.securescape.service.CsrfTokenService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/secure/csrf")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SecureCsrfController {
    
    @Autowired
    private CsrfTokenService csrfTokenService;
    
    // SECURE: Generates and returns CSRF token
    @GetMapping("/form")
    public ResponseEntity<?> getForm(HttpSession session) {
        String sessionId = session.getId();
        String token = csrfTokenService.generateToken(sessionId);
        
        // Store token in session for validation
        session.setAttribute("csrfToken", token);
        
        CsrfFormResponse response = new CsrfFormResponse();
        response.setCsrfToken(token);
        response.setMessage("Form loaded with CSRF protection");
        
        return ResponseEntity.ok(response);
    }
    
    // SECURE: Validates CSRF token before processing
    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody TransferRequest request, HttpSession session) {
        try {
            String sessionId = session.getId();
            String providedToken = request.getCsrf_token();
            String storedToken = (String) session.getAttribute("csrfToken");
            
            // SECURE CODE: Validate CSRF token
            if (providedToken == null || storedToken == null || !providedToken.equals(storedToken)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid CSRF token. Request rejected for security.");
                error.put("message", "CSRF token validation failed - this is the secure behavior!");
                return ResponseEntity.status(403).body(error);
            }
            
            // Token is valid, process the transfer
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Transfer completed (CSRF token validated - secure)");
            response.put("to", request.getTo());
            response.put("amount", request.getAmount());
            response.put("csrfTokenValidated", true);
            
            // Generate new token for next request
            String newToken = csrfTokenService.generateToken(sessionId);
            session.setAttribute("csrfToken", newToken);
            response.put("newCsrfToken", newToken);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Transfer failed: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
}
