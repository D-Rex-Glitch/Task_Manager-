package com.example.taskmanagement.service;

import com.example.taskmanagement.dto.AuthRequest;
import com.example.taskmanagement.dto.AuthResponse;
import com.example.taskmanagement.dto.RegisterRequest;
import com.example.taskmanagement.entity.Role;
import com.example.taskmanagement.entity.User;
import com.example.taskmanagement.exception.BadRequestException;
import com.example.taskmanagement.repository.UserRepository;
import com.example.taskmanagement.security.JwtService;
import com.example.taskmanagement.security.UserPrincipal;
import java.util.Map;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        User saved = userRepository.save(user);

        UserPrincipal principal = new UserPrincipal(saved);
        String token = jwtService.generateToken(principal, Map.of("role", saved.getRole().name(), "userId", saved.getId()));
        return new AuthResponse(token, saved.getRole().name(), saved.getEmail(), saved.getName());
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal, Map.of("role", user.getRole().name(), "userId", user.getId()));
        return new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getName());
    }
}
