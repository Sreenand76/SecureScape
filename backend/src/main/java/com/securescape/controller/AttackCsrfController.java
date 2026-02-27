package com.securescape.controller;

import com.securescape.dto.TransferRequest;
import com.securescape.model.User;
import com.securescape.repository.UserRepository;
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
@CrossOrigin(
        origins = {"http://localhost:3000", "http://localhost:8081", "http://127.0.0.1:5500"},
        allowCredentials = "true"
)
public class AttackCsrfController {

    @Autowired
    private UserRepository userRepository;

    // ❌ VULNERABLE: No CSRF protection
    @GetMapping("/form")
    public ResponseEntity<?> getForm() {
        return ResponseEntity.ok(Map.of(
                "message", "Form loaded (NO CSRF protection)",
                "warning", "This endpoint is vulnerable to CSRF attacks"
        ));
    }

    // ❌ VULNERABLE: POST CSRF
    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(
            @RequestBody TransferRequest request,
            HttpSession session,
            HttpServletRequest httpRequest
    ) {
        Long userId = (Long) session.getAttribute("USER_ID");

        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "error", "User not logged in"
            ));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 💥 REAL CSRF IMPACT
        user.setBalance(user.getBalance() - request.getAmount());
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Transfer completed WITHOUT CSRF protection");
        response.put("amount", request.getAmount());
        response.put("newBalance", user.getBalance());
        response.put("origin", httpRequest.getHeader("Origin"));
        response.put("referer", httpRequest.getHeader("Referer"));
        response.put("warning", "Balance changed without user consent!");

        return ResponseEntity.ok(response);
    }

    // ❌ VULNERABLE: GET CSRF (image/link attack)
    @GetMapping("/transfer")
    public ResponseEntity<?> transferGet(
            @RequestParam Double amount,
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("USER_ID");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBalance(user.getBalance() - amount);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "GET-based CSRF executed",
                "newBalance", user.getBalance(),
                "warning", "GET request modified server state!"
        ));
    }

    // ❌ VULNERABLE: Session leakage
    @GetMapping("/session-info")
    public ResponseEntity<?> getSessionInfo(HttpSession session, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        response.put("sessionId", session.getId());

        Map<String, String> cookies = new HashMap<>();
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                cookies.put(c.getName(), c.getValue());
            }
        }

        response.put("cookies", cookies);
        response.put("origin", request.getHeader("Origin"));
        response.put("warning", "Sensitive session data exposed");

        return ResponseEntity.ok(response);
    }

    // ❌ VULNERABLE: Real profile data
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpSession session) {
        Long userId = (Long) session.getAttribute("USER_ID");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "balance", user.getBalance(),
                "warning", "Profile accessed without CSRF protection"
        ));
    }
}
