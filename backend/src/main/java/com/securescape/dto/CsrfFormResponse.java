package com.securescape.dto;

public class CsrfFormResponse {
    
    private String csrfToken;
    private String message;
    
    public CsrfFormResponse() {
    }
    
    public CsrfFormResponse(String csrfToken, String message) {
        this.csrfToken = csrfToken;
        this.message = message;
    }
    
    public String getCsrfToken() {
        return csrfToken;
    }
    
    public void setCsrfToken(String csrfToken) {
        this.csrfToken = csrfToken;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
