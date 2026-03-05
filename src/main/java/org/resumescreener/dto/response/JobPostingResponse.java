package org.resumescreener.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.resumescreener.domain.enums.EmploymentType;
import org.resumescreener.domain.enums.JobStatus;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class JobPostingResponse {
    private Long id;
    private String title;
    private String description;
    private String requirements;
    private String location;
    private EmploymentType employmentType;
    private JobStatus status;
    private LocalDateTime createdAt;
}

