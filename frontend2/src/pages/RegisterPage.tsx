import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, FileText } from 'lucide-react';

const roles = ['CANDIDATE', 'RECRUITER'] as const;

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<string>('CANDIDATE');
    const [orgId, setOrgId] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Email and password are required'); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

        setLoading(true);
        try {
            const { data } = await registerUser({
                email,
                password,
                role,
                organisationId: orgId ? Number(orgId) : undefined,
            });
            login(data.token, data.email, data.role);
            toast.success('Account created');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center animated-bg px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 gradient-btn glow-violet">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create account</h1>
                    <p className="text-gray-400 mt-2">Get started with RecruitLens</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5 glow-violet">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm dark-input"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm dark-input"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm dark-select"
                        >
                            {roles.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {role !== 'CANDIDATE' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Organisation ID</label>
                            <input
                                type="number"
                                value={orgId}
                                onChange={(e) => setOrgId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-sm dark-input"
                                placeholder="1"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 gradient-btn text-white font-medium py-3 rounded-xl text-sm cursor-pointer"
                    >
                        {loading ? 'Creating...' : <><UserPlus className="w-4 h-4" /> Create Account</>}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
