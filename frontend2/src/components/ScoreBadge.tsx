interface Props {
    score: number;
}

function getColor(score: number) {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
}

function getLabel(score: number) {
    if (score >= 75) return 'Strong Match';
    if (score >= 50) return 'Moderate Match';
    return 'Weak Match';
}

export default function ScoreBadge({ score }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Match Score</span>
                <span className="text-sm font-bold text-white">{score}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${getColor(score)}`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className={`text-xs font-semibold ${score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {getLabel(score)}
            </span>
        </div>
    );
}
