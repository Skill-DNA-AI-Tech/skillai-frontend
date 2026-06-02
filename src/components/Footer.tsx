import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';

interface FooterData {
  text: string;
  linkGroups: Array<{ title: string; links: Array<{ label: string; url: string }> }>;
  copyright: string;
}

const Footer = () => {
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const data = await apiRequest<FooterData>('/admin/footer');
        setFooterData(data);
      } catch (error) {
        console.error('Failed to fetch footer:', error);
        // Fallback to default
        setFooterData({
          text: 'Empowering careers through AI-driven skill assessment and personalized learning paths.',
          linkGroups: [
            {
              title: 'Quick Links',
              links: [
                { label: 'Home', url: '/' },
                { label: 'Dashboard', url: '/dashboard' },
                { label: 'Jobs', url: '/jobs' },
                { label: 'Community', url: '/community' },
              ]
            }
          ],
          copyright: '© 2024 SkillDNA AI. All rights reserved.',
        });
      }
    };
    fetchFooter();
  }, []);

  if (!footerData) return null;

  return (
    <footer className="border-t border-white/10 bg-slate-950/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity w-fit">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
                <span className="text-slate-950 font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-white">SkillDNA AI</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              {footerData.text}
            </p>
          </div>
          
          {footerData.linkGroups?.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-sm font-semibold text-white mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link, index) => {
                  if (!link.url) return null;
                  const isInternal = link.url.startsWith('/') && !link.url.startsWith('//');
                  return (
                    <li key={index}>
                      {isInternal ? (
                        <Link
                          to={link.url}
                          className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          
        </div>
        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-center text-slate-500 text-sm">
            {footerData.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;