import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, FileText } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) { toast.error('All fields are required'); return; }
        setLoading(true);
        try {
            const { data } = await loginUser(email, password);
            login(data.token, data.email, data.role);
            toast.success('Logged in successfully');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
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
                    <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                    <p className="text-gray-400 mt-2">Sign in to your RecruitLens account</p>
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
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 gradient-btn text-white font-medium py-3 rounded-xl text-sm cursor-pointer"
                    >
                        {loading ? 'Signing in...' : <><LogIn className="w-4 h-4" /> Sign In</>}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
