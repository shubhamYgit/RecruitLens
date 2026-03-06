import api from './client';

// ---------- Auth ----------
export const loginUser = (email: string, password: string) =>
    api.post('/auth/login', { email, password });

export const registerUser = (data: {
    email: string;
    password: string;
    role: string;
    organisationId?: number;
}) => api.post('/auth/register', data);

// ---------- Resumes ----------
export const uploadResume = (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/resumes/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const getMyResumes = () => api.get('/resumes/my');

// ---------- Job Postings ----------
export const getJobs = () => api.get('/jobs');

export const getJobById = (id: number) => api.get(`/jobs/${id}`);

export const createJob = (data: {
    title: string;
    jobDescription: string;
    jobRequirements: string;
    location: string;
    employmentType: string;
}) => api.post('/jobs', data);

// ---------- Screening ----------
export const submitScreening = (resumeId: number, jobPostingId: number) =>
    api.post(`/screening/submit?resumeId=${resumeId}&jobPostingId=${jobPostingId}`);

export const getOrganisationScreenings = () =>
    api.get('/screening/organisation');

export const getScreeningsByResume = (resumeId: number) =>
    api.get(`/screening/resume/${resumeId}`);

export const getScreeningsByJob = (jobPostingId: number) =>
    api.get(`/screening/job/${jobPostingId}`);

export const getScreeningById = (id: number) =>
    api.get(`/screening/${id}`);
