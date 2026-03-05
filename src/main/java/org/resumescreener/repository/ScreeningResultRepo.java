package org.resumescreener.repository;

import org.resumescreener.domain.entity.ScreeningResult;
import org.resumescreener.domain.enums.ScreeningStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScreeningResultRepo extends JpaRepository<ScreeningResult, Long> {
    List<ScreeningResult> findByResumeId(Long resumeId);
    List<ScreeningResult> findByJobPostingId(Long jobPostingId);
    List<ScreeningResult> findByScreeningStatus(ScreeningStatus status);

    // eagerly loads Resume and JobPosting in one query — used by the async Gemini thread
    // to avoid LazyInitializationException (no session in @Async thread)
    @Query("SELECT sr FROM ScreeningResult sr JOIN FETCH sr.resume JOIN FETCH sr.jobPosting WHERE sr.id = :id")
    Optional<ScreeningResult> findByIdWithDetails(@Param("id") Long id);
}

