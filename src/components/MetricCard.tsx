import type { LucideIcon } from 'lucide-react';
import ProgressBar from './ProgressBar';

type MetricCardProps = {
  label: string;
  value: string | number;
  suffix?: string;
  icon?: LucideIcon;
  progress?: number;
  tone?: string;
  delta?: string;
};

const MetricCard = ({ label, value, suffix = '', icon: Icon, progress, tone = 'bg-cyan-400', delta }: MetricCardProps) => (
  <article className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-glass backdrop-blur">
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-slate-300">{label}</p>
      {Icon ? <Icon className="h-5 w-5 text-cyan-200" /> : null}
    </div>
    <div className="mt-4 flex items-end justify-between gap-3">
      <p className="text-3xl font-semibold text-white">
        {value}
        {suffix}
      </p>
      {delta ? <span className="rounded bg-emerald-500/[0.15] px-2 py-1 text-xs font-medium text-emerald-200">{delta}</span> : null}
    </div>
    {typeof progress === 'number' ? (
      <div className="mt-5">
        <ProgressBar value={progress} tone={tone} />
      </div>
    ) : null}
  </article>
);

export default MetricCard;
