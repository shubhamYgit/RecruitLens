import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMyResumes, getJobs } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import { FileText, Briefcase, Upload, BarChart3 } from 'lucide-react';
import type { ResumeResponse, JobPostingResponse } from '../api/types';

export default function DashboardPage() {
    const { email, role } = useAuth();

    const resumes = useQuery<ResumeResponse[]>({
        queryKey: ['myResumes'],
        queryFn: () => getMyResumes().then((r) => r.data),
        enabled: role === 'CANDIDATE',
    });

    const jobs = useQuery<JobPostingResponse[]>({
        queryKey: ['jobs'],
        queryFn: () => getJobs().then((r) => r.data),
    });

    if (resumes.isLoading || jobs.isLoading) return <Spinner />;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-1">Welcome back, <span className="text-violet-400">{email}</span></p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {role === 'CANDIDATE' && (
                    <StatCard
                        title="My Resumes"
                        value={resumes.data?.length ?? 0}
                        icon={<FileText className="w-6 h-6" />}
                        color="violet"
                    />
                )}
                <StatCard
                    title="Open Jobs"
                    value={jobs.data?.filter((j) => j.jobStatus === 'OPEN').length ?? 0}
                    icon={<Briefcase className="w-6 h-6" />}
                    color="emerald"
                />
                <StatCard
                    title="Total Jobs"
                    value={jobs.data?.length ?? 0}
                    icon={<BarChart3 className="w-6 h-6" />}
                    color="amber"
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {role === 'CANDIDATE' && (
                        <Link
                            to="/resumes"
                            className="flex items-center gap-4 p-5 glass-card rounded-xl group"
                        >
                            <div className="w-11 h-11 bg-violet-500/10 rounded-xl flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                                <Upload className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">Upload Resume</p>
                                <p className="text-sm text-gray-400">Upload a new PDF resume</p>
                            </div>
                        </Link>
                    )}
                    <Link
                        to="/jobs"
                        className="flex items-center gap-4 p-5 glass-card rounded-xl group"
                    >
                        <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <Briefcase className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Browse Jobs</p>
                            <p className="text-sm text-gray-400">View open job postings</p>
                        </div>
                    </Link>
                    <Link
                        to="/screenings"
                        className="flex items-center gap-4 p-5 glass-card rounded-xl group"
                    >
                        <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                            <BarChart3 className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Screening Results</p>
                            <p className="text-sm text-gray-400">View AI evaluation results</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Jobs */}
            {jobs.data && jobs.data.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Job Postings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jobs.data.slice(0, 4).map((job) => (
                            <div key={job.id} className="glass-card rounded-xl p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-white">{job.title}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{job.location} • {job.employmentType}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${job.jobStatus === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700/50 text-gray-400'
                                        }`}>
                                        {job.jobStatus}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-3 line-clamp-2">{job.jobDescription}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
