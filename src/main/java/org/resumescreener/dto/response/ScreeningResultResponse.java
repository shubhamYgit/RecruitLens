package org.resumescreener.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.resumescreener.domain.enums.ScreeningStatus;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ScreeningResultResponse {
    private Long id;
    private Long resumeId;
    private Long jobPostingId;
    private ScreeningStatus screeningStatus;
    private Integer matchScore;
    private String matchedSkills;
    private String missingSkills;
    private String summary;
    private LocalDateTime createdAt;
}

