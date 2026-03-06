export interface AuthResponse {
    token: string;
    role: string;
    email: string;
}

export interface ResumeResponse {
    id: number;
    filePath: string;
    createdAt: string;
}

export interface JobPostingResponse {
    id: number;
    title: string;
    jobDescription: string;
    jobRequirements: string;
    location: string;
    employmentType: string;
    jobStatus: string;
    createdAt: string;
}

export interface ScreeningResultResponse {
    id: number;
    resumeId: number;
    jobPostingId: number;
    screeningStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    matchScore: number | null;
    matchedSkills: string | null;
    missingSkills: string | null;
    summary: string | null;
    createdAt: string;
}
