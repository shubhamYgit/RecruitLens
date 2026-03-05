package org.resumescreener.controller;

import lombok.RequiredArgsConstructor;
import org.resumescreener.dto.request.JobPostingRequest;
import org.resumescreener.dto.response.JobPostingResponse;
import org.resumescreener.service.JobPostingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobPostingController {

    private final JobPostingService jobPostingService;

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<JobPostingResponse> createJobPosting(@RequestBody JobPostingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(jobPostingService.createJobPosting(request, email));
    }

    @GetMapping
    public ResponseEntity<List<JobPostingResponse>> getAllJobPostings() {
        return ResponseEntity.ok(jobPostingService.getAllJobPostings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostingResponse> getJobPostingById(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.getJobPostingById(id));
    }

    @GetMapping("/organisation/{organisationId}")
    public ResponseEntity<List<JobPostingResponse>> getJobPostingsByOrganisation(@PathVariable Long organisationId) {
        return ResponseEntity.ok(jobPostingService.getJobPostingByOrganisationId(organisationId));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Void> closeJobPosting(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        jobPostingService.closeJobPosting(id, email);
        return ResponseEntity.noContent().build();
    }
}
