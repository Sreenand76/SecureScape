package com.securescape.controller;

import com.securescape.dto.LoginRequest;
import com.securescape.dto.LoginResponse;
import com.securescape.model.User;
import com.securescape.repository.UserRepository;
import com.securescape.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/secure/sql")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SecureSqlController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    // SECURE: Parameterized query - SQL Injection prevented
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // SECURE CODE: Parameterized query using JPA repository
            var userOpt = userRepository.findByUsernameAndPasswordSecure(
                request.getUsername(), 
                request.getPassword()
            );
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
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
    
    // SECURE: Parameterized query - SQL Injection prevented
    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q) {
        try {
            // SECURE CODE: Parameterized query using JPA repository
            List<com.securescape.model.Product> products = productRepository.findByNameContainingSecure(q);
            
            List<Map<String, Object>> productList = products.stream()
                .map(p -> {
                    Map<String, Object> product = new HashMap<>();
                    product.put("id", p.getId());
                    product.put("name", p.getName());
                    product.put("description", p.getDescription());
                    product.put("price", p.getPrice());
                    product.put("stock", p.getStock());
                    return product;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("query", "SELECT * FROM products WHERE name LIKE ? (parameterized)");
            response.put("results", productList);
            response.put("count", productList.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Search failed: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
}
