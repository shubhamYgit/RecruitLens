import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, createJob, getMyResumes, submitScreening } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { Plus, Briefcase, MapPin, Clock, X, Send, FileText } from 'lucide-react';
import type { JobPostingResponse, ResumeResponse } from '../api/types';

const employmentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const;

export default function JobsPage() {
    const { role } = useAuth();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [applyJob, setApplyJob] = useState<JobPostingResponse | null>(null);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [form, setForm] = useState({
        title: '', jobDescription: '', jobRequirements: '', location: '', employmentType: 'FULL_TIME',
    });

    const { data: jobs, isLoading, isError } = useQuery<JobPostingResponse[]>({
        queryKey: ['jobs'],
        queryFn: () => getJobs().then((r) => r.data),
    });

    const { data: resumes } = useQuery<ResumeResponse[]>({
        queryKey: ['myResumes'],
        queryFn: () => getMyResumes().then((r) => r.data),
        enabled: role === 'CANDIDATE',
    });

    const createMutation = useMutation({
        mutationFn: () => createJob(form),
        onSuccess: () => {
            toast.success('Job posting created');
            setShowForm(false);
            setForm({ title: '', jobDescription: '', jobRequirements: '', location: '', employmentType: 'FULL_TIME' });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create job'),
    });

    const applyMutation = useMutation({
        mutationFn: () => submitScreening(Number(selectedResumeId), applyJob!.id),
        onSuccess: () => {
            toast.success('Applied! AI is evaluating your resume...');
            setApplyJob(null);
            setSelectedResumeId('');
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Application failed'),
    });

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.jobDescription || !form.jobRequirements) {
            toast.error('Title, description, and requirements are required');
            return;
        }
        createMutation.mutate();
    };

    const handleApply = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedResumeId) { toast.error('Please select a resume'); return; }
        applyMutation.mutate();
    };

    if (isLoading) return <Spinner />;
    if (isError) return (
        <div className="flex items-center justify-center py-20 text-red-400">
            Failed to load job postings. Make sure the backend is running.
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Job Postings</h1>
                    <p className="text-gray-400 mt-1">Browse or create job openings</p>
                </div>
                {(role === 'RECRUITER' || role === 'ADMIN') && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2.5 gradient-btn text-white rounded-xl text-sm font-medium cursor-pointer"
                    >
                        {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showForm ? 'Cancel' : 'Create Job'}
                    </button>
                )}
            </div>

            {/* Create Job Form */}
            {showForm && (
                <form onSubmit={handleCreate} className="glass-card rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white">New Job Posting</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl text-sm dark-input"
                                placeholder="e.g. Java Backend Developer" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
                            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl text-sm dark-input"
                                placeholder="e.g. Remote" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Employment Type</label>
                        <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl text-sm dark-select">
                            {employmentTypes.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                        <textarea rows={3} value={form.jobDescription} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl text-sm dark-input resize-none"
                            placeholder="Describe the role..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Requirements</label>
                        <textarea rows={2} value={form.jobRequirements} onChange={(e) => setForm({ ...form, jobRequirements: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl text-sm dark-input resize-none"
                            placeholder="e.g. Java, Spring Boot, PostgreSQL, Docker" />
                    </div>
                    <button type="submit" disabled={createMutation.isPending}
                        className="px-6 py-2.5 gradient-btn text-white rounded-xl text-sm font-medium cursor-pointer">
                        {createMutation.isPending ? 'Creating...' : 'Create Job Posting'}
                    </button>
                </form>
            )}

            {/* Job Listings */}
            {jobs && jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="glass-card rounded-2xl p-6 flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${job.jobStatus === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700/50 text-gray-400'
                                    }`}>{job.jobStatus}</span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>}
                                {job.employmentType && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.employmentType.replace('_', ' ')}</span>}
                            </div>

                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{job.jobDescription}</p>

                            {job.jobRequirements && (
                                <div className="mb-4">
                                    <p className="text-xs font-medium text-gray-500 mb-2">Requirements:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {job.jobRequirements.split(',').map((req) => (
                                            <span key={req.trim()} className="px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded-full text-xs font-medium border border-violet-500/20">{req.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
                                <p className="text-xs text-gray-500">Posted {new Date(job.createdAt).toLocaleDateString()} • ID: {job.id}</p>
                                {role === 'CANDIDATE' && job.jobStatus === 'OPEN' && (
                                    <button
                                        onClick={() => { setApplyJob(job); setSelectedResumeId(''); }}
                                        className="flex items-center gap-1.5 px-4 py-2 gradient-btn text-white rounded-lg text-sm font-medium cursor-pointer"
                                    >
                                        <Send className="w-3.5 h-3.5" /> Apply
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card rounded-xl p-10 text-center">
                    <Briefcase className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No job postings yet</p>
                </div>
            )}

            {/* Apply Modal */}
            {applyJob && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card rounded-2xl w-full max-w-md p-6 glow-violet">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Apply for Position</h2>
                            <button onClick={() => setApplyJob(null)} className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-5">
                            <p className="font-medium text-violet-300">{applyJob.title}</p>
                            <p className="text-sm text-violet-400/70 mt-0.5">{applyJob.location} • {applyJob.employmentType?.replace('_', ' ')}</p>
                        </div>

                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Resume</label>
                                {resumes && resumes.length > 0 ? (
                                    <select value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm dark-select">
                                        <option value="">Choose a resume...</option>
                                        {resumes.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.filePath.split(/[\\/]/).pop()} (ID: {r.id})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
                                        <FileText className="w-4 h-4 shrink-0" />
                                        No resumes uploaded yet. Go to Resumes page to upload one first.
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setApplyJob(null)}
                                    className="flex-1 px-4 py-2.5 border border-white/10 text-gray-300 rounded-xl text-sm font-medium hover:bg-white/5 cursor-pointer transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={applyMutation.isPending || !resumes?.length}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 gradient-btn text-white rounded-xl text-sm font-medium cursor-pointer">
                                    {applyMutation.isPending ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Application</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
