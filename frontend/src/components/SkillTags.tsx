interface Props {
  skills: string;
  type: 'matched' | 'missing';
}

export default function SkillTags({ skills, type }: Props) {
  if (!skills) return null;
  const list = skills.split(',').map((s) => s.trim()).filter(Boolean);
  const styles =
    type === 'matched'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200';

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

