package org.resumescreener.repository;

import org.resumescreener.domain.entity.JobPosting;
import org.resumescreener.domain.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepo extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByOrganisationId(Long organisationId);
    List<JobPosting> findByJobStatus(JobStatus jobStatus);
}
