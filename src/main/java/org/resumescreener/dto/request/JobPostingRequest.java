package org.resumescreener.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.resumescreener.domain.enums.EmploymentType;

@Getter
@Setter
public class JobPostingRequest {
    private String title;
    private String description;
    private String requirements;
    private String location;
    private EmploymentType employmentType;
}

