package com.example.taskmanagement.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.taskmanagement.dto.AdminUpdateUserRequest;
import com.example.taskmanagement.dto.UpdateUserRequest;
import com.example.taskmanagement.dto.UserProfileResponse;
import com.example.taskmanagement.entity.Role;
import com.example.taskmanagement.entity.User;
import com.example.taskmanagement.exception.BadRequestException;
import com.example.taskmanagement.exception.ResourceNotFoundException;
import com.example.taskmanagement.repository.UserRepository;
import com.example.taskmanagement.security.UserPrincipal;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileResponse getMe() {
        User user = getCurrentUser();
        return toResponse(user);
    }

    public UserProfileResponse updateMe(UpdateUserRequest request) {
        User user = getCurrentUser();

        String nextName = request.getName();
        String nextEmail = request.getEmail();
        boolean hasNameUpdate = nextName != null && !nextName.trim().isEmpty();
        boolean hasEmailUpdate = nextEmail != null && !nextEmail.trim().isEmpty();

        if (!hasNameUpdate && !hasEmailUpdate) {
            throw new BadRequestException("Provide name or email to update");
        }

        if (hasNameUpdate) {
            String normalizedName = nextName == null ? "" : nextName.trim();
            user.setName(normalizedName);
        }

        if (hasEmailUpdate) {
            String normalizedEmail = nextEmail == null ? "" : nextEmail.trim().toLowerCase();
            if (userRepository.existsByEmailAndIdNot(normalizedEmail, user.getId())) {
                throw new BadRequestException("Email already registered");
            }
            user.setEmail(normalizedEmail);
        }

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserProfileResponse updateUserByAdmin(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String nextName = request.getName();
        String nextEmail = request.getEmail();
        Role nextRole = request.getRole();
        boolean hasNameUpdate = nextName != null && !nextName.trim().isEmpty();
        boolean hasEmailUpdate = nextEmail != null && !nextEmail.trim().isEmpty();
        boolean hasRoleUpdate = nextRole != null;

        if (!hasNameUpdate && !hasEmailUpdate && !hasRoleUpdate) {
            throw new BadRequestException("Provide name, email, or role to update");
        }

        User currentUser = getCurrentUser();
        if (hasRoleUpdate && currentUser.getId().equals(user.getId()) && nextRole != user.getRole()) {
            throw new BadRequestException("Admin cannot change own role");
        }

        if (hasNameUpdate) {
            user.setName(nextName == null ? "" : nextName.trim());
        }

        if (hasEmailUpdate) {
            String normalizedEmail = nextEmail == null ? "" : nextEmail.trim().toLowerCase();
            if (userRepository.existsByEmailAndIdNot(normalizedEmail, user.getId())) {
                throw new BadRequestException("Email already registered");
            }
            user.setEmail(normalizedEmail);
        }

        if (hasRoleUpdate) {
            user.setRole(nextRole);
        }

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public void deleteUserByAdmin(Long id) {
        User currentUser = getCurrentUser();
        if (currentUser.getId().equals(id)) {
            throw new BadRequestException("Admin cannot delete own account");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserPrincipal userPrincipal)) {
            throw new BadRequestException("Invalid authentication context");
        }
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}
