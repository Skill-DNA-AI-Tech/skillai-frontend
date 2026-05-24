import type { ReactNode } from 'react';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

const SectionHeader = ({ eyebrow, title, description, action }: SectionHeaderProps) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="max-w-3xl">
      {eyebrow ? <p className="text-sm font-medium uppercase text-cyan-200">{eyebrow}</p> : null}
      <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-base leading-7 text-slate-300">{description}</p> : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export default SectionHeader;
