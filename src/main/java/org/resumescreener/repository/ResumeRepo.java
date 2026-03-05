package org.resumescreener.repository;

import org.resumescreener.domain.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeRepo extends JpaRepository<Resume,Long> {
    List<Resume> findByCandidateId(Long candidateId);
}
