package com.securescape.controller;

import com.securescape.dto.CommentRequest;
import com.securescape.dto.CommentResponse;
import com.securescape.model.Comment;
import com.securescape.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.HtmlUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/secure/xss")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SecureXssController {
    
    @Autowired
    private CommentRepository commentRepository;
    
    // SECURE: HTML entity encoding applied before storage
    @PostMapping("/comment")
    public ResponseEntity<?> addComment(@RequestBody CommentRequest request) {
        try {
            Comment comment = new Comment();
            // SECURE: HTML entity encoding to prevent XSS
            String sanitized = HtmlUtils.htmlEscape(request.getText());
            comment.setText(sanitized);
            comment = commentRepository.save(comment);
            
            CommentResponse response = new CommentResponse(
                comment.getId(),
                comment.getText(),
                comment.getCreatedAt()
            );
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("comment", response);
            result.put("message", "Comment added (HTML encoded - secure)");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add comment: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
    
    // SECURE: Returns HTML-encoded content
    @GetMapping("/comments")
    public ResponseEntity<?> getComments() {
        try {
            List<Comment> comments = commentRepository.findAllByOrderByCreatedAtDesc();
            
            // SECURE: HTML encode all comment text before returning
            List<CommentResponse> commentList = comments.stream()
                .map(c -> {
                    String encoded = HtmlUtils.htmlEscape(c.getText());
                    return new CommentResponse(c.getId(), encoded, c.getCreatedAt());
                })
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("comments", commentList);
            response.put("message", "Comments are HTML encoded - protected from XSS");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve comments: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
}
