package com.example.taskmanagement.dto;

public class AuthResponse {

    private String token;
    private String role;
    private String email;
    private String name;

    public AuthResponse(String token, String role, String email, String name) {
        this.token = token;
        this.role = role;
        this.email = email;
        this.name = name;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }
}
