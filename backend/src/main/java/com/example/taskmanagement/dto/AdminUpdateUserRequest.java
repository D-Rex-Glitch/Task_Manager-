package com.example.taskmanagement.dto;

import com.example.taskmanagement.entity.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class AdminUpdateUserRequest {

    @Size(max = 80)
    private String name;

    @Email
    private String email;

    private Role role;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
