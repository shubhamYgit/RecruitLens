interface Props {
    skills: string;
    type: 'matched' | 'missing';
}

export default function SkillTags({ skills, type }: Props) {
    if (!skills) return null;
    const list = skills.split(',').map((s) => s.trim()).filter(Boolean);
    const styles =
        type === 'matched'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20';

    return (
        <div className="flex flex-wrap gap-2">
            {list.map((skill) => (
                <span
                    key={skill}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles}`}
                >
                    {skill}
                </span>
            ))}
        </div>
    );
}
