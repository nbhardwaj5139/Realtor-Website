'use client';

import { motion } from 'framer-motion';
import { Phone, Play } from 'lucide-react';
import { siteConfig } from '@/config/site';

/**
 * The five real people, with their real titles and direct lines.
 *
 * Their current site puts the team behind "View Profile" links; here the
 * number is on the card, because reaching a person is the point.
 */
export function EdTeam() {
  return (
    <section id="team" className="bg-ed-night py-24 text-white md:py-32">
      <div className="container">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ed-accent">
              The team
            </p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.025em]">
              {siteConfig.about.headline.split(',')[0]},
              <span className="block italic text-white/55">and the team behind them.</span>
            </h2>
            <p className="mt-7 max-w-md text-[16px] leading-relaxed text-white/60">
              {siteConfig.about.body}
            </p>

            <a
              href={siteConfig.proof.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-9 inline-flex items-center gap-4 border border-white/20 px-6 py-4 transition-colors hover:border-white/50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-ed-accent">
                <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
              </span>
              <span className="text-left">
                <span className="block text-[14px]">Watch the channel</span>
                <span className="block text-[12px] text-white/45">
                  {siteConfig.proof.youtubeViews} views on YouTube
                </span>
              </span>
            </a>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {siteConfig.agents.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-6 py-6"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 font-serif text-[15px] text-white/70">
                  {agent.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[1.35rem] leading-tight tracking-[-0.01em]">
                    {agent.name}
                  </p>
                  <p className="mt-1 text-[13px] text-white/50">{agent.role}</p>
                </div>
                <a
                  href={agent.phoneHref}
                  className="flex shrink-0 items-center gap-2 text-[14px] tabular-nums text-white/70 transition-colors hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{agent.phone}</span>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
