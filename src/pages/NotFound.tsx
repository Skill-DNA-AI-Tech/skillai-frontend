import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
    <h1 className="text-4xl font-semibold text-white">Page not found</h1>
    <p className="mt-4 text-slate-300">The requested SkillDNA AI page is not available.</p>
    <Link className="mt-8 inline-flex rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200" to="/">
      Go home
    </Link>
  </main>
);

export default NotFound;
