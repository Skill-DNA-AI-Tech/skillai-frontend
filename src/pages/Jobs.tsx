import { BriefcaseBusiness } from 'lucide-react';
import { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    apiRequest('/profiles/me', { token }).then(setProfile).catch(() => setProfile(null));
  }, [token]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="Career opportunities"
        title="Find roles that fit your evidence"
        description="Job matching will use published opportunities and your saved SkillDNA evidence. This page does not display placeholder companies or invented match scores."
      />

      <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-8 sm:p-12">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
            <BriefcaseBusiness className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-white">No published opportunities are available yet</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Your profile and verified skills are safe. Once employers publish roles through the connected job catalog, eligible opportunities and transparent match explanations will appear here.
          </p>
          {!profile && <p className="mt-5 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">Complete your profile to prepare for future matching.</p>}
        </div>
      </section>
    </main>
  );
};

export default Jobs;
