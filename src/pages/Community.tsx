import { Calendar, MessageCircle, Plus, UsersRound, Video } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { mentorSessions } from '../data/platform';

const Community = () => {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeader
        eyebrow="Community and mentorship"
        title="Mentors, alumni, forums, peer groups, and live doubt solving"
        description="Students can book mentors, join domain communities, ask questions, attend webinars, and practice with peers."
        action={
          <button className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">
            <Plus className="h-4 w-4" />
            Ask
          </button>
        }
      />

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-cyan-200" />
            <h3 className="font-semibold text-white">Mentor sessions</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {mentorSessions.map((session) => (
              <article key={session.mentor} className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
                <h4 className="font-semibold text-white">{session.mentor}</h4>
                <p className="mt-1 text-sm text-slate-400">{session.field}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-slate-300">{session.time}</span>
                  <button className="rounded-md bg-emerald-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-200">Book</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-emerald-200" />
            <h3 className="font-semibold text-white">Discussion forum</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              { title: 'How should I present a pharmacy project to recruiters?', meta: 'Pharmacy - 18 replies' },
              { title: 'Best way to revise mechanics before campus hiring?', meta: 'Engineering - 32 replies' },
              { title: 'Can a BSc chemistry student move into analytics?', meta: 'Science - 11 replies' },
            ].map((post) => (
              <article key={post.title} className="rounded-lg border border-white/10 bg-slate-900/[0.84] p-5">
                <h4 className="font-semibold text-white">{post.title}</h4>
                <p className="mt-2 text-sm text-slate-400">{post.meta}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { icon: UsersRound, title: 'Peer groups', text: 'Domain cohorts for practice, accountability, and group discussion rounds.' },
          { icon: Video, title: 'Webinars', text: 'Live career guidance, alumni talks, interview prep, and Q&A sessions.' },
          { icon: MessageCircle, title: 'Doubt solving', text: 'Topic-specific questions, mentor responses, and community answers.' },
        ].map((item) => (
          <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
            <item.icon className="h-6 w-6 text-cyan-200" />
            <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Community;
