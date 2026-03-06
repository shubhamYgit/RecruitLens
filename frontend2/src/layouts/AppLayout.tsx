import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-[#0a0e1a]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}
