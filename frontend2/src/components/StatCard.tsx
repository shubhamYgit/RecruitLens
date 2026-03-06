import type { ReactNode } from 'react';

interface Props {
    title: string;
    value: string | number;
    icon: ReactNode;
    color: 'violet' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
    violet: 'bg-violet-500/10 text-violet-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    rose: 'bg-rose-500/10 text-rose-400',
};

export default function StatCard({ title, value, icon, color }: Props) {
    return (
        <div className="glass-card rounded-2xl p-6 glow-hover">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
