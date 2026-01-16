package com.securescape.config;

import com.securescape.model.Comment;
import com.securescape.model.Product;
import com.securescape.model.User;
import com.securescape.repository.CommentRepository;
import com.securescape.repository.ProductRepository;
import com.securescape.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Initialize users
        if (userRepository.count() == 0) {
            userRepository.save(new User(null, "admin", "admin123", "admin@securescape.com", "ADMIN"));
            userRepository.save(new User(null, "user1", "password123", "user1@securescape.com", "USER"));
            userRepository.save(new User(null, "john", "john123", "john@example.com", "USER"));
            System.out.println("Initialized users");
        }
        
        // Initialize products
        if (productRepository.count() == 0) {
            productRepository.save(new Product(null, "Laptop", "High-performance laptop","Released", 999.99, 10));
            productRepository.save(new Product(null, "Mouse", "Wireless mouse","Released", 29.99, 50));
            productRepository.save(new Product(null, "Keyboard", "Mechanical keyboard","Released",79.99, 30));
            productRepository.save(new Product(null, "Monitor", "4K monitor","Unreleased", 299.99, 15));
            productRepository.save(new Product(null, "Webcam", "HD webcam","Unreleased", 49.99, 25));
            System.out.println("Initialized products");
        }
        
        // Initialize sample comments
        if (commentRepository.count() == 0) {
            commentRepository.save(new Comment(null, "This is a great product!", null));
            commentRepository.save(new Comment(null, "I love using this platform for learning!", null));
            System.out.println("Initialized comments");
        }
    }
}
