package org.resumescreener.controller;

import lombok.RequiredArgsConstructor;
import org.resumescreener.dto.response.ScreeningResultResponse;
import org.resumescreener.service.ScreeningService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screening")
@RequiredArgsConstructor
public class ScreeningController {

    private final ScreeningService screeningService;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ScreeningResultResponse> submitForScreening(
            @RequestParam Long resumeId,
            @RequestParam Long jobPostingId) {
        return ResponseEntity.ok(screeningService.submitForScreening(resumeId, jobPostingId));
    }

    @GetMapping("/resume/{resumeId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<ScreeningResultResponse>> getResultsByResume(@PathVariable Long resumeId) {
        return ResponseEntity.ok(screeningService.getResultsByResume(resumeId));
    }

    @GetMapping("/organisation")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<List<ScreeningResultResponse>> getResultsByOrganisation(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(screeningService.getResultsByOrganisation(user.getUsername()));
    }

    @GetMapping("/job/{jobPostingId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<List<ScreeningResultResponse>> getResultsByJobPosting(@PathVariable Long jobPostingId) {
        return ResponseEntity.ok(screeningService.getResultsByJobPosting(jobPostingId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreeningResultResponse> getResultById(@PathVariable Long id) {
        return ResponseEntity.ok(screeningService.getResultById(id));
    }
}
