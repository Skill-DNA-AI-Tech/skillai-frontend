import { MessageCircle, UsersRound, Video } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';

const Community = () => {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="Community"
        title="Learn with other people in your field"
        description="Connect with peers, mentors, and domain discussions when live community content is available for your account."
      />

      <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900/60 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
            <MessageCircle className="h-6 w-6 text-cyan-200" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">No live community sessions are available yet.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">We are keeping this space honest: there are no placeholder mentors, invented discussion counts, or inactive booking buttons. Your learning path and assessments remain available while community content is connected.</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { icon: UsersRound, title: 'Peer groups', text: 'Domain cohorts for practice and accountability once a group is available.' },
          { icon: Video, title: 'Live sessions', text: 'Mentor talks and Q&A events will appear here with real schedules and capacity.' },
          { icon: MessageCircle, title: 'Doubt solving', text: 'Topic-specific questions and answers will be shown from the connected community service.' },
        ].map((item) => (
          <article key={item.title} className="rounded-xl border border-white/10 bg-slate-900/40 p-5">
            <item.icon className="h-6 w-6 text-cyan-200" />
            <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Community;
