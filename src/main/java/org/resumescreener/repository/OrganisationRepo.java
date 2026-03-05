package org.resumescreener.repository;

import org.resumescreener.domain.entity.Organisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganisationRepo extends JpaRepository<Organisation, Long> {
    boolean existsByName(String name);
}
