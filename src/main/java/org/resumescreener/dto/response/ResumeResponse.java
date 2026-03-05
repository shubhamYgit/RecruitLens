package org.resumescreener.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ResumeResponse {
    private Long id;
    private String filePath;
    private LocalDateTime createdAt;
}

