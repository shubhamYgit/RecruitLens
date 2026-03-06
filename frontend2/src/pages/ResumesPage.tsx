import { useState, type ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadResume, getMyResumes } from '../api/endpoints';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import type { ResumeResponse } from '../api/types';

export default function ResumesPage() {
    const [file, setFile] = useState<File | null>(null);
    const queryClient = useQueryClient();

    const { data: resumes, isLoading } = useQuery<ResumeResponse[]>({
        queryKey: ['myResumes'],
        queryFn: () => getMyResumes().then((r) => r.data),
    });

    const mutation = useMutation({
        mutationFn: (f: File) => uploadResume(f),
        onSuccess: () => {
            toast.success('Resume uploaded successfully');
            setFile(null);
            queryClient.invalidateQueries({ queryKey: ['myResumes'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Upload failed');
        },
    });

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null;
        if (selected && selected.type !== 'application/pdf') {
            toast.error('Only PDF files are allowed');
            return;
        }
        if (selected && selected.size > 5 * 1024 * 1024) {
            toast.error('File size must be under 5MB');
            return;
        }
        setFile(selected);
    };

    const handleUpload = () => {
        if (!file) { toast.error('Please select a file'); return; }
        mutation.mutate(file);
    };

    if (isLoading) return <Spinner />;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">My Resumes</h1>
                <p className="text-gray-400 mt-1">Upload and manage your resumes</p>
            </div>

            {/* Upload Card */}
            <div className="glass-card rounded-2xl p-8">
                <h2 className="text-lg font-semibold text-white mb-4">Upload Resume</h2>

                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-violet-500/30 transition-colors">
                    <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-3">
                        {file ? file.name : 'Drag and drop or click to select a PDF file'}
                    </p>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="inline-block px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-white/10 border border-white/10 transition-colors"
                    >
                        Choose File
                    </label>
                </div>

                {file && (
                    <div className="mt-4 flex items-center justify-between bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-violet-400" />
                            <div>
                                <p className="text-sm font-medium text-white">{file.name}</p>
                                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={mutation.isPending}
                            className="px-4 py-2 gradient-btn text-white rounded-lg text-sm font-medium cursor-pointer"
                        >
                            {mutation.isPending ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                )}
            </div>

            {/* Previous Resumes */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Uploaded Resumes</h2>
                {resumes && resumes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resumes.map((r) => (
                            <div key={r.id} className="glass-card rounded-xl p-5 flex items-center gap-4">
                                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-violet-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-white truncate">{r.filePath.split(/[\\/]/).pop()}</p>
                                    <p className="text-xs text-gray-500">
                                        Uploaded {new Date(r.createdAt).toLocaleDateString()} • ID: {r.id}
                                    </p>
                                </div>
                                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-xl p-10 text-center">
                        <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No resumes uploaded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
