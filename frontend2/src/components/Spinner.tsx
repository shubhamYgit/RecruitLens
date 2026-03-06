import { Loader2 } from 'lucide-react';

export default function Spinner() {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
    );
}
