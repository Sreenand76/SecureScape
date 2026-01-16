package com.securescape.dto;

public class TransferRequest {
    
    private String to;
    private Double amount;
    private String csrf_token; // Only used in secure mode
    
    public TransferRequest() {
    }
    
    public TransferRequest(String to, Double amount, String csrf_token) {
        this.to = to;
        this.amount = amount;
        this.csrf_token = csrf_token;
    }
    
    public String getTo() {
        return to;
    }
    
    public void setTo(String to) {
        this.to = to;
    }
    
    public Double getAmount() {
        return amount;
    }
    
    public void setAmount(Double amount) {
        this.amount = amount;
    }
    
    public String getCsrf_token() {
        return csrf_token;
    }
    
    public void setCsrf_token(String csrf_token) {
        this.csrf_token = csrf_token;
    }
}
