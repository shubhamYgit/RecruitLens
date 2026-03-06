import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyResumes, getJobs, submitScreening, getScreeningsByResume, getOrganisationScreenings } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ScoreBadge from '../components/ScoreBadge';
import SkillTags from '../components/SkillTags';
import toast from 'react-hot-toast';
import { BarChart3, Send, RefreshCw, AlertCircle, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { ResumeResponse, JobPostingResponse, ScreeningResultResponse } from '../api/types';

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
    PENDING: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10' },
    PROCESSING: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    COMPLETED: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    FAILED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function ScreeningsPage() {
    const { role } = useAuth();
    const queryClient = useQueryClient();
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [screenResumeId, setScreenResumeId] = useState('');
    const [screenJobId, setScreenJobId] = useState('');

    const { data: resumes } = useQuery<ResumeResponse[]>({
        queryKey: ['myResumes'],
        queryFn: () => getMyResumes().then((r) => r.data),
        enabled: role === 'CANDIDATE',
    });

    const { data: jobs } = useQuery<JobPostingResponse[]>({
        queryKey: ['jobs'],
        queryFn: () => getJobs().then((r) => r.data),
    });

    const { data: screenings, isLoading: screeningsLoading } = useQuery<ScreeningResultResponse[]>({
        queryKey: ['screenings', selectedResumeId],
        queryFn: () => getScreeningsByResume(selectedResumeId!).then((r) => r.data),
        enabled: !!selectedResumeId,
    });

    const { data: orgScreenings, isLoading: orgScreeningsLoading, refetch: refetchOrgScreenings } = useQuery<ScreeningResultResponse[]>({
        queryKey: ['orgScreenings'],
        queryFn: () => getOrganisationScreenings().then((r) => r.data),
        enabled: role === 'RECRUITER' || role === 'ADMIN',
    });

    const submitMutation = useMutation({
        mutationFn: () => submitScreening(Number(screenResumeId), Number(screenJobId)),
        onSuccess: () => {
            toast.success('Screening submitted! AI is evaluating your resume...');
            setScreenResumeId('');
            setScreenJobId('');
            if (selectedResumeId === Number(screenResumeId)) {
                queryClient.invalidateQueries({ queryKey: ['screenings', selectedResumeId] });
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Screening submission failed');
        },
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!screenResumeId || !screenJobId) {
            toast.error('Select both a resume and a job');
            return;
        }
        submitMutation.mutate();
    };

    const refreshScreenings = () => {
        if (selectedResumeId) {
            queryClient.invalidateQueries({ queryKey: ['screenings', selectedResumeId] });
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Screening Results</h1>
                <p className="text-gray-400 mt-1">Submit resumes for AI evaluation and view results</p>
            </div>

            {/* Submit for Screening */}
            {role === 'CANDIDATE' && (
                <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Submit for Screening</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Resume</label>
                            <select
                                value={screenResumeId}
                                onChange={(e) => setScreenResumeId(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl text-sm dark-select"
                            >
                                <option value="">Select resume</option>
                                {resumes?.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.filePath.split(/[\\/]/).pop()} (ID: {r.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Posting</label>
                            <select
                                value={screenJobId}
                                onChange={(e) => setScreenJobId(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl text-sm dark-select"
                            >
                                <option value="">Select job</option>
                                {jobs?.map((j) => (
                                    <option key={j.id} value={j.id}>{j.title} (ID: {j.id})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={submitMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 gradient-btn text-white rounded-xl text-sm font-medium cursor-pointer"
                            >
                                {submitMutation.isPending ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit</>}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* View Results By Resume */}
            {role === 'CANDIDATE' && resumes && resumes.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">View Results</h2>
                        {selectedResumeId && (
                            <button
                                onClick={refreshScreenings}
                                className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 cursor-pointer transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" /> Refresh
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {resumes.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setSelectedResumeId(r.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${selectedResumeId === r.id
                                        ? 'gradient-btn text-white'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                                    }`}
                            >
                                Resume #{r.id}
                            </button>
                        ))}
                    </div>

                    {selectedResumeId && screeningsLoading && <Spinner />}

                    {selectedResumeId && screenings && screenings.length === 0 && (
                        <div className="text-center py-10">
                            <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">No screening results for this resume</p>
                        </div>
                    )}

                    {screenings && screenings.length > 0 && (
                        <div className="space-y-4">
                            {screenings.map((s) => {
                                const cfg = statusConfig[s.screeningStatus] || statusConfig.PENDING;
                                const StatusIcon = cfg.icon;

                                return (
                                    <div key={s.id} className="border border-white/5 rounded-xl p-6 bg-white/[0.02]">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                                                    <StatusIcon className={`w-3.5 h-3.5 ${s.screeningStatus === 'PROCESSING' ? 'animate-spin' : ''}`} />
                                                    {s.screeningStatus}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Job #{s.jobPostingId} • {new Date(s.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Completed Result */}
                                        {s.screeningStatus === 'COMPLETED' && s.matchScore !== null && (
                                            <div className="space-y-5">
                                                <ScoreBadge score={s.matchScore} />

                                                {s.matchedSkills && (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-300 mb-2">✅ Matched Skills</p>
                                                        <SkillTags skills={s.matchedSkills} type="matched" />
                                                    </div>
                                                )}

                                                {s.missingSkills && (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-300 mb-2">❌ Missing Skills</p>
                                                        <SkillTags skills={s.missingSkills} type="missing" />
                                                    </div>
                                                )}

                                                {s.summary && (
                                                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                                                        <p className="text-sm font-medium text-gray-300 mb-1">AI Summary</p>
                                                        <p className="text-sm text-gray-400 leading-relaxed">{s.summary}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(s.screeningStatus === 'PENDING' || s.screeningStatus === 'PROCESSING') && (
                                            <p className="text-sm text-gray-400">
                                                AI evaluation in progress... Click "Refresh" to check for updates.
                                            </p>
                                        )}

                                        {s.screeningStatus === 'FAILED' && (
                                            <p className="text-sm text-red-400">
                                                Evaluation failed. Please try submitting again.
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Empty state if no resumes */}
            {role === 'CANDIDATE' && (!resumes || resumes.length === 0) && (
                <div className="glass-card rounded-xl p-10 text-center">
                    <BarChart3 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Upload a resume first to submit for screening</p>
                </div>
            )}

            {/* ── RECRUITER / ADMIN VIEW ── */}
            {(role === 'RECRUITER' || role === 'ADMIN') && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Organisation Screening Results</h2>
                            <p className="text-sm text-gray-500 mt-0.5">All candidate screenings for your organisation's job postings</p>
                        </div>
                        <button
                            onClick={() => refetchOrgScreenings()}
                            className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 cursor-pointer transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                    </div>

                    {orgScreeningsLoading && <Spinner />}

                    {!orgScreeningsLoading && (!orgScreenings || orgScreenings.length === 0) && (
                        <div className="glass-card rounded-xl p-10 text-center">
                            <BarChart3 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">No screening results yet for your organisation</p>
                        </div>
                    )}

                    {orgScreenings && orgScreenings.length > 0 && (
                        <div className="space-y-4">
                            {/* Summary bar */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {(['COMPLETED', 'PROCESSING', 'PENDING', 'FAILED'] as const).map((status) => {
                                    const count = orgScreenings.filter((s) => s.screeningStatus === status).length;
                                    const cfg = statusConfig[status];
                                    const StatusIcon = cfg.icon;
                                    return (
                                        <div key={status} className={`rounded-xl p-4 ${cfg.bg} flex items-center gap-3 border border-white/5`}>
                                            <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                                            <div>
                                                <p className={`text-xl font-bold ${cfg.color}`}>{count}</p>
                                                <p className="text-xs text-gray-500">{status}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Result cards */}
                            {orgScreenings.map((s) => {
                                const cfg = statusConfig[s.screeningStatus] || statusConfig.PENDING;
                                const StatusIcon = cfg.icon;
                                return (
                                    <div key={s.id} className="glass-card rounded-2xl p-6">
                                        {/* Header */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                                                    <StatusIcon className={`w-3.5 h-3.5 ${s.screeningStatus === 'PROCESSING' ? 'animate-spin' : ''}`} />
                                                    {s.screeningStatus}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Job #{s.jobPostingId} • Resume #{s.resumeId} • {new Date(s.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {s.screeningStatus === 'COMPLETED' && s.matchScore !== null && (
                                                <span className={`text-lg font-bold ${s.matchScore >= 75 ? 'text-emerald-400' : s.matchScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                    {s.matchScore}% match
                                                </span>
                                            )}
                                        </div>

                                        {s.screeningStatus === 'COMPLETED' && s.matchScore !== null && (
                                            <div className="space-y-4">
                                                <ScoreBadge score={s.matchScore} />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {s.matchedSkills && (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-300 mb-2">✅ Matched Skills</p>
                                                            <SkillTags skills={s.matchedSkills} type="matched" />
                                                        </div>
                                                    )}
                                                    {s.missingSkills && (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-300 mb-2">❌ Missing Skills</p>
                                                            <SkillTags skills={s.missingSkills} type="missing" />
                                                        </div>
                                                    )}
                                                </div>

                                                {s.summary && (
                                                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                                                        <p className="text-sm font-medium text-gray-300 mb-1">AI Summary</p>
                                                        <p className="text-sm text-gray-400 leading-relaxed">{s.summary}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(s.screeningStatus === 'PENDING' || s.screeningStatus === 'PROCESSING') && (
                                            <p className="text-sm text-gray-400">AI evaluation in progress...</p>
                                        )}
                                        {s.screeningStatus === 'FAILED' && (
                                            <p className="text-sm text-red-400">Evaluation failed for this resume.</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
