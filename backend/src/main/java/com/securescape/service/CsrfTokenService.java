package com.securescape.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CsrfTokenService {
    
    private final ConcurrentHashMap<String, String> tokenStore = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    
    public String generateToken(String sessionId) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        tokenStore.put(sessionId, token);
        return token;
    }
    
    public boolean validateToken(String sessionId, String token) {
        String storedToken = tokenStore.get(sessionId);
        return storedToken != null && storedToken.equals(token);
    }
    
    public void removeToken(String sessionId) {
        tokenStore.remove(sessionId);
    }
}
