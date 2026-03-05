package org.resumescreener.service;

import lombok.RequiredArgsConstructor;
import org.resumescreener.domain.entity.JobPosting;
import org.resumescreener.domain.entity.Organisation;
import org.resumescreener.domain.entity.User;
import org.resumescreener.domain.enums.JobStatus;
import org.resumescreener.dto.request.JobPostingRequest;
import org.resumescreener.dto.response.JobPostingResponse;
import org.resumescreener.repository.JobPostingRepo;
import org.resumescreener.repository.OrganisationRepo;
import org.resumescreener.repository.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobPostingService{
    private final UserRepo userRepo;
    private final OrganisationRepo organisationRepo;
    private final JobPostingRepo jobPostingRepo;

    public JobPostingResponse createJobPosting(JobPostingRequest request , String email){
        User recruiter = userRepo.findByEmail(email).orElseThrow(()->new RuntimeException("Recruiter Not Found"));

        Organisation organisation=organisationRepo.findById(recruiter.getOrganisationId()).orElseThrow(()->new RuntimeException("Organisation Not Found"));

        JobPosting jobPosting=new JobPosting();
        jobPosting.setOrganisation(organisation);
        jobPosting.setTitle(request.getTitle());
        jobPosting.setJobDescription(request.getDescription());
        jobPosting.setJobRequirements(request.getRequirements());
        jobPosting.setLocation(request.getLocation());
        jobPosting.setEmploymentType(request.getEmploymentType());
        jobPosting.setJobStatus(JobStatus.OPEN);

        jobPostingRepo.save(jobPosting);
        return mapToResponse(jobPosting);
    }

    public List<JobPostingResponse> getAllJobPostings(){
        return jobPostingRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<JobPostingResponse> getJobPostingByOrganisationId(Long organisationId){
        return jobPostingRepo.findByOrganisationId(organisationId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public JobPostingResponse getJobPostingById(Long id){
        JobPosting jobPosting = jobPostingRepo.findById(id).orElseThrow(()->new RuntimeException("Posting Not Found"));
        return mapToResponse(jobPosting);
    }

    public void closeJobPosting(Long id,String email){
        User recruiter = userRepo.findByEmail(email).orElseThrow(()->new RuntimeException("Recruiter Not Found"));

        JobPosting jobPosting=jobPostingRepo.findById(id).orElseThrow(()->new RuntimeException("Job Posting Not Found"));

        if(!jobPosting.getOrganisation().getId().equals(recruiter.getOrganisationId())){
             throw new RuntimeException("Unauthorised");
        }

        jobPosting.setJobStatus(JobStatus.CLOSED);
        jobPostingRepo.save(jobPosting);
    }

    private JobPostingResponse mapToResponse(JobPosting jobPosting){
        return new JobPostingResponse(
               jobPosting.getId(),
               jobPosting.getTitle(),
               jobPosting.getJobDescription(),
               jobPosting.getJobRequirements(),
                jobPosting.getLocation(),
                jobPosting.getEmploymentType(),
                jobPosting.getJobStatus(),
                jobPosting.getCreatedAt()
        );
    }
}