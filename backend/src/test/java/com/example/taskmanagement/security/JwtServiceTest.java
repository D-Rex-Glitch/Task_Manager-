package com.example.taskmanagement.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.jsonwebtoken.ExpiredJwtException;
import java.util.HashMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

class JwtServiceTest {

    private static final String SECRET = "VGhpc0lzQVNlY3VyZTY0Q2hhcmFjdGVyTWluaW11bVNlY3JldEtleUZvckpXVFRva2Vu";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 60_000L);
    }

    @Test
    void generateTokenCreatesValidTokenForSameUser() {
        UserDetails user = User.withUsername("alice@example.com").password("ignored").roles("USER").build();

        String token = jwtService.generateToken(user, new HashMap<>());

        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void isTokenValidReturnsFalseForDifferentUser() {
        UserDetails tokenOwner = User.withUsername("alice@example.com").password("ignored").roles("USER").build();
        UserDetails otherUser = User.withUsername("bob@example.com").password("ignored").roles("USER").build();

        String token = jwtService.generateToken(tokenOwner, new HashMap<>());

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void isTokenValidThrowsForExpiredToken() {
        UserDetails user = User.withUsername("alice@example.com").password("ignored").roles("USER").build();
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", -1L);

        String token = jwtService.generateToken(user, new HashMap<>());

        assertThrows(ExpiredJwtException.class, () -> jwtService.isTokenValid(token, user));
    }
}
