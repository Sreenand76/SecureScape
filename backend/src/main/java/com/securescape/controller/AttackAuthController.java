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

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/attack/auth")
@CrossOrigin(
        origins = {"http://localhost:3000", "http://localhost:8081", "http://127.0.0.1:5500"},
        allowCredentials = "true"
)
public class AttackAuthController {

    @Autowired
    private UserRepository userRepository;

    // ❌ BROKEN: Username enumeration + no lockout + no session rotation.
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthLoginRequest request, HttpSession session) {
        Map<String, Object> res = new HashMap<>();

        if (request.getUsername() == null || request.getPassword() == null) {
            res.put("success", false);
            res.put("error", "Missing username or password");
            return ResponseEntity.ok(res);
        }

        var userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            res.put("success", false);
            res.put("error", "User not found"); // enumeration
            return ResponseEntity.ok(res);
        }

        User user = userOpt.get();
        if (!request.getPassword().equals(user.getPassword())) {
            res.put("success", false);
            res.put("error", "Wrong password"); // enumeration
            return ResponseEntity.ok(res);
        }

        session.setAttribute("USER_ID", user.getId());
        res.put("success", true);
        res.put("message", "Logged in (insecure)");
        res.put("sessionId", session.getId());
        res.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));
        return ResponseEntity.ok(res);
    }

    // ❌ BROKEN: Sensitive info disclosure for demo (whoami shows full user + session id).
    @GetMapping("/whoami")
    public ResponseEntity<?> whoami(HttpSession session, HttpServletRequest request) {
        Map<String, Object> res = new HashMap<>();
        res.put("sessionId", session.getId());
        res.put("origin", request.getHeader("Origin"));

        Long userId = (Long) session.getAttribute("USER_ID");
        if (userId == null) {
            res.put("authenticated", false);
            return ResponseEntity.ok(res);
        }

        User user = userRepository.findById(userId).orElse(null);
        res.put("authenticated", true);
        res.put("user", user == null ? null : Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "password", user.getPassword() // intentionally bad
        ));
        return ResponseEntity.ok(res);
    }

    // ❌ BROKEN: Logout does not invalidate session (easy session reuse).
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Logged out (but session not invalidated)");
        res.put("sessionId", session.getId());
        session.removeAttribute("USER_ID");
        return ResponseEntity.ok(res);
    }

    // ❌ BROKEN: Change password without verifying old password (account takeover).
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req) {
        Map<String, Object> res = new HashMap<>();

        if (req.getUsername() == null || req.getNewPassword() == null) {
            res.put("success", false);
            res.put("error", "Missing username or newPassword");
            return ResponseEntity.ok(res);
        }

        var userOpt = userRepository.findByUsername(req.getUsername());
        if (userOpt.isEmpty()) {
            res.put("success", false);
            res.put("error", "User not found");
            return ResponseEntity.ok(res);
        }

        User user = userOpt.get();
        user.setPassword(req.getNewPassword()); // plaintext update (intentionally bad)
        userRepository.save(user);

        res.put("success", true);
        res.put("message", "Password changed WITHOUT verifying old password (insecure)");
        res.put("username", user.getUsername());
        return ResponseEntity.ok(res);
    }
}

