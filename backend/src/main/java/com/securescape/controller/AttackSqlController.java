package com.securescape.controller;

import com.securescape.dto.LoginRequest;
import com.securescape.dto.LoginResponse;
import com.securescape.model.User;
import com.securescape.repository.UserRepository;
import com.securescape.repository.ProductRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attack/sql")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AttackSqlController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    // VULNERABLE: Direct string concatenation - SQL Injection possible
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // VULNERABLE CODE: Direct string concatenation
            String sql = "SELECT * FROM users WHERE username = '" + 
                        request.getUsername() + 
                        "' AND password = '" + 
                        request.getPassword() + "'";
            
            Query query = entityManager.createNativeQuery(sql, User.class);
            @SuppressWarnings("unchecked")
            List<User> users = query.getResultList();
            
            if (!users.isEmpty()) {
                User user = users.get(0);
                LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole()
                );
                return ResponseEntity.ok(new LoginResponse(true, "Login successful", userInfo));
            } else {
                return ResponseEntity.ok(new LoginResponse(false, "Invalid credentials", null));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(new LoginResponse(false, "Error: " + e.getMessage(), null));
        }
    }
    
    // VULNERABLE: Direct string concatenation - SQL Injection possible
    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q) {
        try {
            // VULNERABLE CODE: Direct string concatenation
            String sql = "SELECT * FROM products WHERE name LIKE '%" + q + "%'";
            
            Query query = entityManager.createNativeQuery(sql);
            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();
            
            List<Map<String, Object>> products = results.stream()
                .map(row -> {
                    Map<String, Object> product = new HashMap<>();
                    product.put("id", row[0]);
                    product.put("name", row[1]);
                    product.put("description", row[2]);
                    product.put("status", row[4]);
                    product.put("price", row[3]);
                    product.put("stock", row[5]);
                    return product;
                })
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("query", sql);
            response.put("results", products);
            response.put("count", products.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Search failed: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
}
