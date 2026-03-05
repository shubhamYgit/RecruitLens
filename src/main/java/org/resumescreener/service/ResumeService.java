package org.resumescreener.service;

import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.resumescreener.domain.entity.Resume;
import org.resumescreener.domain.entity.User;
import org.resumescreener.dto.response.ResumeResponse;
import org.resumescreener.repository.ResumeRepo;
import org.resumescreener.repository.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepo resumeRepo;
    private final UserRepo userRepo;

    public ResumeResponse uploadResume(MultipartFile file, String email) throws IOException {

        User candidate = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")); // TODO: ResourceNotFoundException


        String extractedText = extractTextFromPdf(file);


        // TODO: later replace with actual file storage (e.g. local disk or cloud)
        String filePath = "uploads/" + file.getOriginalFilename();

        Resume resume = new Resume();
        resume.setCandidate(candidate);
        resume.setFilePath(filePath);
        resume.setExtractedText(extractedText);

        resumeRepo.save(resume);
        return mapToResponse(resume);
    }

    public List<ResumeResponse> getResumesByCandidate(String email) {
        User candidate = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")); // TODO: ResourceNotFoundException

        return resumeRepo.findByCandidateId(candidate.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private ResumeResponse mapToResponse(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getFilePath(),
                resume.getCreatedAt()
        );
    }
}
