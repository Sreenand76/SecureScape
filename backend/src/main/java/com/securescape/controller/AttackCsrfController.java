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
@RequestMapping("/api/attack/csrf")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
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
    public ResponseEntity<?> transfer(@RequestBody TransferRequest request, HttpSession session) {
        try {
            // VULNERABLE CODE: No CSRF token validation
            // Any request from any origin will be processed
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Transfer completed (VULNERABLE - no CSRF protection)");
            response.put("to", request.getTo());
            response.put("amount", request.getAmount());
            response.put("warning", "This transfer was processed without CSRF token validation!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Transfer failed: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
}
