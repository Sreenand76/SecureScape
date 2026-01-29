package com.securescape.controller;

import com.securescape.dto.CommentRequest;
import com.securescape.dto.CommentResponse;
import com.securescape.model.Comment;
import com.securescape.repository.CommentRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attack/xss")
@CrossOrigin(origins = "*", allowCredentials = "true") // Allow all origins for attack simulation
public class AttackXssController {
    
    @Autowired
    private CommentRepository commentRepository;
    
    // VULNERABLE: Stores raw HTML without sanitization (Stored XSS)
    @PostMapping("/comment")
    public ResponseEntity<?> addComment(@RequestBody CommentRequest request) {
        try {
            Comment comment = new Comment();
            comment.setText(request.getText()); // VULNERABLE: No sanitization
            comment = commentRepository.save(comment);
            
            CommentResponse response = new CommentResponse(
                comment.getId(),
                comment.getText(),
                comment.getCreatedAt()
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("comment", response);
            result.put("message", "Comment added (vulnerable to XSS)");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add comment: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
    
    // VULNERABLE: Returns raw HTML without encoding (Stored XSS)
    @GetMapping("/comments")
    public ResponseEntity<?> getComments() {
        try {
            List<Comment> comments = commentRepository.findAllByOrderByCreatedAtDesc();
            
            List<CommentResponse> commentList = comments.stream()
                .map(c -> new CommentResponse(c.getId(), c.getText(), c.getCreatedAt()))
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("comments", commentList);
            response.put("warning", "Comments are returned without HTML encoding - vulnerable to XSS");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve comments: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
    
    // VULNERABLE: Reflected XSS - User input directly reflected in response
    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q, HttpServletRequest request) {
        try {
            Map<String, Object> response = new HashMap<>();
            // VULNERABLE: Direct reflection without encoding
            response.put("query", q);
            response.put("results", "Search results for: " + q);
            response.put("warning", "VULNERABLE: Reflected XSS - user input directly reflected");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Search failed: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
    
    // VULNERABLE: Returns session information (for cookie stealing demo)
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
            
            response.put("warning", "VULNERABLE: Session information exposed");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get session info: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
}
