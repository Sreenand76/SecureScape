package com.securescape.controller;

import com.securescape.dto.CsrfFormResponse;
import com.securescape.dto.TransferRequest;
import com.securescape.model.User;
import com.securescape.repository.UserRepository;
import com.securescape.service.CsrfTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/secure/csrf")
@CrossOrigin(
        origins = {"http://localhost:3000", "http://localhost:8081", "http://127.0.0.1:5500"},
        allowCredentials = "true"
)
public class SecureCsrfController {

    @Autowired
    private CsrfTokenService csrfTokenService;

    @Autowired
    private UserRepository userRepository;

    // ✅ SECURE: Generate CSRF token
    @GetMapping("/form")
    public ResponseEntity<?> getForm(HttpSession session) {
        String token = csrfTokenService.generateToken(session.getId());
        session.setAttribute("csrfToken", token);

        CsrfFormResponse response = new CsrfFormResponse();
        response.setCsrfToken(token);
        response.setMessage("Form loaded with CSRF protection");

        return ResponseEntity.ok(response);
    }

    // ✅ SECURE: Validate CSRF token + REAL STATE CHANGE
    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(
            @RequestBody TransferRequest request,
            HttpSession session
    ) {
        try {
            String providedToken = request.getCsrf_token();
            String storedToken = (String) session.getAttribute("csrfToken");

            // 🔐 CSRF VALIDATION
            if (providedToken == null || storedToken == null || !providedToken.equals(storedToken)) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Invalid CSRF token",
                        "message", "Request blocked by CSRF protection"
                ));
            }

            // ✅ AUTHENTICATED USER
            Long userId = (Long) session.getAttribute("USER_ID");
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "error", "User not authenticated"
                ));
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 💰 REAL TRANSFER (SECURE)
            user.setBalance(user.getBalance() - request.getAmount());
            userRepository.save(user);

            // 🔄 Rotate CSRF token
            String newToken = csrfTokenService.generateToken(session.getId());
            session.setAttribute("csrfToken", newToken);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Transfer completed securely");
            response.put("to", request.getTo());
            response.put("amount", request.getAmount());
            response.put("newBalance", user.getBalance());
            response.put("csrfTokenValidated", true);
            response.put("newCsrfToken", newToken);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "error", "Transfer failed",
                    "details", e.getMessage()
            ));
        }
    }

    // ✅ SECURE: Session info (no sensitive cookies echoed back)
    @GetMapping("/session-info")
    public ResponseEntity<?> getSessionInfo(HttpSession session, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("origin", request.getHeader("Origin"));
        response.put("message", "Session established with CSRF protection");
        return ResponseEntity.ok(response);
    }

    // ✅ SECURE: Profile endpoint (read‑only, still requires authenticated session)
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpSession session) {
        Long userId = (Long) session.getAttribute("USER_ID");

        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "error", "User not authenticated"
            ));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "balance", user.getBalance(),
                "message", "Profile accessed with CSRF protection enabled"
        ));
    }
}
