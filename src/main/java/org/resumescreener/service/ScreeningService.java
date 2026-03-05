package org.resumescreener.service;

import lombok.RequiredArgsConstructor;
import org.resumescreener.domain.entity.JobPosting;
import org.resumescreener.domain.entity.Resume;
import org.resumescreener.domain.entity.ScreeningResult;
import org.resumescreener.domain.entity.User;
import org.resumescreener.domain.entity.User;
import org.resumescreener.dto.response.ScreeningResultResponse;
import org.resumescreener.repository.JobPostingRepo;
import org.resumescreener.repository.ResumeRepo;
import org.resumescreener.repository.ScreeningResultRepo;
import org.resumescreener.repository.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScreeningService {
    private final ScreeningResultRepo screeningResultRepo;
    private final ResumeRepo resumeRepo;
    private final JobPostingRepo jobPostingRepo;
    private final GeminiService geminiService;
    private final UserRepo userRepo;

    public ScreeningResultResponse submitForScreening(Long resumeId,Long jobPostingId){
        Resume resume = resumeRepo.findById(resumeId).orElseThrow(()->new RuntimeException("Resume Not Found")); // TODO: ResourceNotFoundException
        JobPosting jobPosting = jobPostingRepo.findById(jobPostingId).orElseThrow(()->new RuntimeException("Job Posting Not Found"));

        ScreeningResult screeningResult=new ScreeningResult();
        screeningResult.setResume(resume);
        screeningResult.setJobPosting(jobPosting);

        // save first so the DB generates the ID, then pass that ID to Gemini async job
        ScreeningResult saved = screeningResultRepo.save(screeningResult);

        geminiService.evaluateResume(saved.getId());

        return mapToResponse(saved);
    }

    public List<ScreeningResultResponse> getResultsByOrganisation(String recruiterEmail) {
        User recruiter = userRepo.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));


        return jobPostingRepo.findByOrganisationId(recruiter.getOrganisationId())
                .stream()
                .flatMap(job -> screeningResultRepo.findByJobPostingId(job.getId()).stream())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ScreeningResultResponse> getResultsByResume(Long resumeId) {
        return screeningResultRepo.findByResumeId(resumeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ScreeningResultResponse> getResultsByJobPosting(Long jobPostingId) {
        return screeningResultRepo.findByJobPostingId(jobPostingId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ScreeningResultResponse getResultById(Long id) {
        ScreeningResult result = screeningResultRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Screening result not found")); // TODO: ResourceNotFoundException
        return mapToResponse(result);
    }

    private ScreeningResultResponse mapToResponse(ScreeningResult result) {
        return new ScreeningResultResponse(
                result.getId(),
                result.getResume().getId(),
                result.getJobPosting().getId(),
                result.getScreeningStatus(),
                result.getMatchScore(),
                result.getMatchedSkills(),
                result.getMissingSkills(),
                result.getSummary(),
                result.getCreatedAt()
        );
    }

}
