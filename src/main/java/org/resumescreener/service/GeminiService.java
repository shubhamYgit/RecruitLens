package org.resumescreener.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.resumescreener.domain.entity.ScreeningResult;
import org.resumescreener.domain.enums.ScreeningStatus;
import org.resumescreener.repository.ScreeningResultRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;
import java.util.concurrent.Semaphore;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final ScreeningResultRepo screeningResultRepo;
    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    private static final int MAX_RETRIES = 3;


    private final Semaphore geminiLimiter = new Semaphore(2);

    @Async
    public void evaluateResume(Long screeningResultId) {

        ScreeningResult result = screeningResultRepo.findByIdWithDetails(screeningResultId)
                .orElseThrow(() -> new RuntimeException("Screening result not found"));

        result.setScreeningStatus(ScreeningStatus.PROCESSING);
        screeningResultRepo.save(result);

        try {

            String resumeText = truncate(result.getResume().getExtractedText(), 6000);
            String jobRequirements = truncate(result.getJobPosting().getJobRequirements(), 2000);

            String prompt = buildPrompt(resumeText, jobRequirements);

            String geminiResponse = callGeminiApiWithRetry(prompt);

            parseAndUpdate(result, geminiResponse);

            result.setScreeningStatus(ScreeningStatus.COMPLETED);

        } catch (Exception e) {
            log.error("Gemini evaluation failed for screeningResultId={}: {}", screeningResultId, e.getMessage());
            result.setScreeningStatus(ScreeningStatus.FAILED);
        }

        screeningResultRepo.save(result);
    }

    private String truncate(String text, int maxChars) {
        if (text == null) return "";
        return text.length() > maxChars ? text.substring(0, maxChars) : text;
    }

    private String buildPrompt(String resumeText, String jobRequirements) {
        return """
                Evaluate this resume against the job requirements.
                Respond ONLY in raw JSON format:

                {
                  "matchScore": <integer 0-100>,
                  "matchedSkills": "<comma separated matched skills>",
                  "missingSkills": "<comma separated missing skills>",
                  "summary": "<2-3 sentence evaluation>"
                }

                Resume:
                """ + resumeText + """

                Job Requirements:
                """ + jobRequirements;
    }

    private String callGeminiApiWithRetry(String prompt) throws InterruptedException {

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {

            try {

                geminiLimiter.acquire();

                return webClient.post()
                        .uri(GEMINI_URL + "?key=" + geminiApiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();


            } catch (WebClientResponseException e) {

                if (e.getStatusCode().value() == 429 && attempt < MAX_RETRIES) {

                    long delay = (long) Math.pow(2, attempt) * 2000;

                    log.warn("Gemini rate limited (429). Attempt {}/{}. Retrying in {}ms...",
                            attempt, MAX_RETRIES, delay);

                    Thread.sleep(delay);

                } else {
                    throw e;
                }

            } finally {
                geminiLimiter.release();
            }
        }

        throw new RuntimeException("Gemini API failed after retries");
    }

    private void parseAndUpdate(ScreeningResult result, String geminiResponse) {

        JsonNode root = objectMapper.readTree(geminiResponse);

        JsonNode candidates = root.path("candidates");

        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("Invalid Gemini response structure");
        }

        String text = candidates.get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .stringValue();

        text = text.trim();

        if (text.startsWith("```")) {
            text = text.replaceAll("(?s)```json\\s*|```", "").trim();
        }

        JsonNode parsed = objectMapper.readTree(text);

        result.setMatchScore(parsed.path("matchScore").asInt());
        result.setMatchedSkills(parsed.path("matchedSkills").stringValue());
        result.setMissingSkills(parsed.path("missingSkills").stringValue());
        result.setSummary(parsed.path("summary").stringValue());
    }
}