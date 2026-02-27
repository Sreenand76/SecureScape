package com.securescape.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.securescape.model.User;
import com.securescape.repository.UserRepository;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Component
public class SessionBootstrapFilter implements Filter {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpSession session = req.getSession(true);
        String path = req.getRequestURI();

        // ⚠️ DEMO ONLY – simulate logged-in victim for CSRF attack demos
        // Apply to BOTH insecure and secure CSRF endpoints so the UI works in both modes
        if (path.startsWith("/api/attack/csrf") || path.startsWith("/api/secure/csrf")) {

            if (session.getAttribute("USER_ID") == null) {

                // Use an existing demo user as the CSRF "victim" account
                User victim = userRepository.findByUsername("user1")
                        .orElseThrow(() -> new RuntimeException("Demo user 'user1' missing"));

                session.setAttribute("USER_ID", victim.getId());
            }
        }

        chain.doFilter(request, response);
    }
}
