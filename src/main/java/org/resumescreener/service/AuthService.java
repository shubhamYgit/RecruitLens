package org.resumescreener.service;

import lombok.RequiredArgsConstructor;
import org.resumescreener.domain.entity.User;
import org.resumescreener.domain.enums.Role;
import org.resumescreener.dto.request.LoginRequest;
import org.resumescreener.dto.request.RegisterRequest;
import org.resumescreener.dto.response.AuthResponse;
import org.resumescreener.repository.UserRepo;
import org.resumescreener.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // check if email already exists
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered"); // TODO: DuplicateResourceException
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.CANDIDATE);
        user.setOrganisationId(request.getOrganisationId());

        userRepo.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        // authenticates credentials — throws exception automatically if invalid
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found")); // TODO: ResourceNotFoundException

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getEmail());
    }
}

