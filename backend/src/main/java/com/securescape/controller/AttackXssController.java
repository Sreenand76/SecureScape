package com.securescape.controller;

import com.securescape.dto.CommentRequest;
import com.securescape.dto.CommentResponse;
import com.securescape.model.Comment;
import com.securescape.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attack/xss")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AttackXssController {
    
    @Autowired
    private CommentRepository commentRepository;
    
    // VULNERABLE: Stores raw HTML without sanitization
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
    
    // VULNERABLE: Returns raw HTML without encoding
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
}
