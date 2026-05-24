type ProgressBarProps = {
  value: number;
  tone?: string;
};

const ProgressBar = ({ value, tone = 'bg-cyan-400' }: ProgressBarProps) => (
  <div className="h-2 w-full overflow-hidden rounded bg-slate-800">
    <div className={`h-full ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

export default ProgressBar;
