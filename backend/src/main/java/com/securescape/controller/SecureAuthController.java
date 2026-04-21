package com.securescape.controller;

import com.securescape.dto.AuthLoginRequest;
import com.securescape.dto.ChangePasswordRequest;
import com.securescape.model.User;
import com.securescape.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/secure/auth")
@CrossOrigin(
        origins = {"http://localhost:3000", "http://localhost:8081", "http://127.0.0.1:5500"},
        allowCredentials = "true"
)
public class SecureAuthController {

    @Autowired
    private UserRepository userRepository;

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_MS = 60_000;

    private final ConcurrentHashMap<String, AttemptState> attempts = new ConcurrentHashMap<>();

    private static class AttemptState {
        int failures;
        long lockUntilEpochMs;
    }

    private String key(HttpServletRequest request, String username) {
        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For")).orElse(request.getRemoteAddr());
        return ip + "|" + (username == null ? "" : username.toLowerCase());
    }

    private boolean isLocked(AttemptState s) {
        return s != null && s.lockUntilEpochMs > System.currentTimeMillis();
    }

    // ✅ SECURE: Generic error messages + basic lockout + session rotation on login.
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody AuthLoginRequest request,
            HttpServletRequest httpRequest,
            HttpSession session
    ) {
        String username = request.getUsername();
        String k = key(httpRequest, username);
        AttemptState s = attempts.get(k);
        if (isLocked(s)) {
            return ResponseEntity.status(429).body(Map.of(
                    "success", false,
                    "error", "Too many attempts. Try again later."
            ));
        }

        if (username == null || request.getPassword() == null) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", "Invalid credentials"
            ));
        }

        var userOpt = userRepository.findByUsernameAndPasswordSecure(username, request.getPassword());
        if (userOpt.isEmpty()) {
            AttemptState next = attempts.computeIfAbsent(k, kk -> new AttemptState());
            next.failures++;
            if (next.failures >= MAX_ATTEMPTS) {
                next.lockUntilEpochMs = System.currentTimeMillis() + LOCK_MS;
            }
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", "Invalid credentials"
            ));
        }

        // Rotate session id to reduce session fixation risk
        session.invalidate();
        HttpSession newSession = httpRequest.getSession(true);
        User user = userOpt.get();
        newSession.setAttribute("USER_ID", user.getId());

        attempts.remove(k);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Logged in (secure)",
                "sessionId", newSession.getId(),
                "user", Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        ));
    }

    // ✅ SECURE: Minimal user info.
    @GetMapping("/whoami")
    public ResponseEntity<?> whoami(HttpSession session) {
        Long userId = (Long) session.getAttribute("USER_ID");
        if (userId == null) {
            return ResponseEntity.ok(Map.of(
                    "authenticated", false
            ));
        }

        User user = userRepository.findById(userId).orElse(null);
        return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "user", user == null ? null : Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        ));
    }

    // ✅ SECURE: Invalidate session on logout.
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Logged out"
        ));
    }

    // ✅ SECURE: Verify old password + basic password policy.
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req) {
        if (req.getUsername() == null || req.getOldPassword() == null || req.getNewPassword() == null) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", "Invalid request"
            ));
        }

        if (req.getNewPassword().length() < 8) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", "Password must be at least 8 characters"
            ));
        }

        var userOpt = userRepository.findByUsernameAndPasswordSecure(req.getUsername(), req.getOldPassword());
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", "Invalid credentials"
            ));
        }

        User user = userOpt.get();
        user.setPassword(req.getNewPassword()); // still plaintext in this project
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password changed"
        ));
    }
}

