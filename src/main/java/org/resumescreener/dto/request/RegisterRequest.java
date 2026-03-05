package org.resumescreener.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.resumescreener.domain.enums.Role;

@Getter
@Setter
public class RegisterRequest {
    private String email;
    private String password;
    private Role role;
    private Long organisationId; // optional, null for candidates
}

