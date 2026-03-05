package org.resumescreener.controller;

import lombok.RequiredArgsConstructor;
import org.resumescreener.dto.response.ResumeResponse;
import org.resumescreener.service.ResumeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {
    private final ResumeService resumeService;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    @PostMapping("/upload")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails user
    ) throws IOException {
        validateFile(file);
        String email = user.getUsername();
        ResumeResponse response = resumeService.uploadResume(file, email);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<ResumeResponse>> getMyResumes(
            @AuthenticationPrincipal UserDetails user
    ) {
        String email = user.getUsername();
        List<ResumeResponse> resumes = resumeService.getResumesByCandidate(email);
        return ResponseEntity.ok(resumes);
    }
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }
        if (!"application/pdf".equals(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }
    }
}