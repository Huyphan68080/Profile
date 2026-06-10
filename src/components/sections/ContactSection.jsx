import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { FiMail, FiMapPin } from 'react-icons/fi';
import { contactMeta, socialLinks } from '../../data/siteData';
import RippleButton from '../common/RippleButton';
import SectionTitle from '../common/SectionTitle';

gsap.registerPlugin(ScrollTrigger);

const ContactSection = () => {
  const sectionRef = useRef(null);
  const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success, error

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from('.contact-chip', {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        y: 14, opacity: 0, duration: 0.5, ease: 'power3.out',
      });

      gsap.from('.contact-info', {
        scrollTrigger: { trigger: '.contact-info', start: 'top 88%', toggleActions: 'play none none none' },
        x: -24, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out',
      });

      gsap.from('.contact-form', {
        scrollTrigger: { trigger: '.contact-form', start: 'top 88%', toggleActions: 'play none none none' },
        x: 24, opacity: 0, duration: 0.6, ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Formspree/EmailJS placeholder integration (feel free to swap in your Formspree ID)
    // const formData = new FormData(e.target);
    // try {
    //   const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    //     method: 'POST',
    //     body: formData,
    //     headers: { Accept: 'application/json' }
    //   });
    //   if (response.ok) setFormStatus('success');
    //   else setFormStatus('error');
    // } catch (error) {
    //   setFormStatus('error');
    // }

    // Mock network request
    setTimeout(() => {
      setFormStatus('success');
      e.target.reset();
      setTimeout(() => setFormStatus('idle'), 4000);
    }, 1500);
  };

  return (
    <section id="contact" className="frame-shell" ref={sectionRef}>
      <div 
        className="frame-surface flex flex-col justify-start md:justify-center overflow-y-auto" 
        data-lenis-prevent
      >
        <div className="grid items-center gap-4 lg:grid-cols-[1fr_1.15fr] xl:gap-6 w-full py-2">
          {/* Left — Info & Socials */}
          <div className="flex flex-col justify-center">
            <div className="contact-chip story-chip self-start mb-1.5">Final Frame</div>
            <SectionTitle
              kicker="Contact"
              title="Let's build something together."
              subtitle="Drop a message and I'll get back to you as soon as possible."
              compact
              className="mt-1 mb-3"
            />

            <div className="grid gap-3 w-full">
              {/* Info Details Card */}
              <article className="group contact-info glass-panel rounded-[1.4rem] border border-zinc-200/60 p-4 sm:p-5 relative bg-white/[0.60] hover:bg-white/[0.68] hover:border-zinc-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
                {/* Corner decorative blueprint brackets */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-300 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-300 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-300 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-300 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Shimmer sheen */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                <span className="absolute top-3.5 right-4 font-mono text-[6.5px] text-zinc-400 tracking-widest uppercase">[CHANNELS]</span>

                <div className="flex items-center gap-2.5 text-xs text-zinc-800 font-medium">
                  <FiMail className="shrink-0 text-zinc-500" size={14} />
                  <p className="hover:text-zinc-950 transition-colors">{contactMeta.email}</p>
                </div>
                <div className="mt-3 flex items-center gap-2.5 text-xs text-zinc-800 font-medium">
                  <FiMapPin className="shrink-0 text-zinc-500" size={14} />
                  <p>{contactMeta.location}</p>
                </div>
                <div className="mt-3 border-t border-zinc-200/50 pt-2.5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] sm:text-[11px] leading-relaxed text-zinc-500 font-mono tracking-wide uppercase">{contactMeta.availability}</p>
                </div>
              </article>

              {/* Social Channels Card */}
              <article className="group contact-info glass-panel rounded-[1.4rem] border border-zinc-200/60 p-4 sm:p-5 relative bg-white/[0.60] hover:bg-white/[0.68] hover:border-zinc-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
                {/* Corner decorative blueprint brackets */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-300 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-300 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-300 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-300 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Shimmer sheen */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                <div className="flex items-center justify-between border-b border-zinc-200/50 pb-2 mb-3">
                  <h3 className="cyber-title text-[8.5px] uppercase tracking-[0.24em] text-zinc-500 font-extrabold">Social Connections</h3>
                  <span className="font-mono text-[6.5px] text-zinc-400 uppercase tracking-widest">[ NET_SOC ]</span>
                </div>
                <div className="flex flex-wrap gap-1.5 font-sans">
                  {socialLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-zinc-200 bg-white/40 px-3 py-1.5 text-xs text-zinc-700 font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-800 hover:bg-zinc-900 hover:text-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </article>
            </div>
          </div>

          {/* Right — Diagnostic Transmitter Form */}
          <form
            onSubmit={handleSubmit}
            className="group/form contact-form glass-panel rounded-[1.4rem] border border-zinc-200/60 p-4 sm:p-5 relative bg-white/[0.72] hover:bg-white/[0.78] hover:border-zinc-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300"
          >
            {/* Corner decorative blueprint brackets */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-zinc-300 opacity-60 group-hover/form:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-zinc-300 opacity-60 group-hover/form:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-zinc-300 opacity-60 group-hover/form:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-zinc-300 opacity-60 group-hover/form:opacity-100 transition-opacity duration-300" />

            {/* Form Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/50 pb-2.5 mb-4">
              <span className="font-mono text-[7px] sm:text-[7.5px] text-zinc-400 uppercase tracking-[0.2em]">[ COMPONENT: TRANSMITTER // SYS_XMIT ]</span>
              <span className="font-mono text-[7px] text-zinc-400 tracking-wider">STATUS: READY</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-zinc-700 block relative">
                <span className="font-mono text-[8px] sm:text-[8.5px] text-zinc-400 uppercase tracking-widest block mb-1.5">[ INPUT: NAME ]</span>
                <input
                  type="text"
                  name="name"
                  required
                  disabled={formStatus === 'submitting' || formStatus === 'success'}
                  className="w-full rounded-xl border border-zinc-200/60 bg-white/20 px-3.5 py-2.5 text-base md:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-zinc-800 focus:bg-white/40 focus:shadow-[0_4px_12px_rgba(0,0,0,0.02)] disabled:opacity-50"
                  placeholder="Your name"
                />
              </label>
              <label className="text-xs text-zinc-700 block relative">
                <span className="font-mono text-[8px] sm:text-[8.5px] text-zinc-400 uppercase tracking-widest block mb-1.5">[ INPUT: EMAIL ]</span>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={formStatus === 'submitting' || formStatus === 'success'}
                  className="w-full rounded-xl border border-zinc-200/60 bg-white/20 px-3.5 py-2.5 text-base md:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-zinc-800 focus:bg-white/40 focus:shadow-[0_4px_12px_rgba(0,0,0,0.02)] disabled:opacity-50"
                  placeholder="you@email.com"
                />
              </label>
            </div>
            <label className="mt-3 block text-xs text-zinc-700 relative">
              <span className="font-mono text-[8px] sm:text-[8.5px] text-zinc-400 uppercase tracking-widest block mb-1.5">[ INPUT: MESSAGE ]</span>
              <textarea
                name="message"
                required
                rows={3}
                disabled={formStatus === 'submitting' || formStatus === 'success'}
                className="w-full rounded-xl border border-zinc-200/60 bg-white/20 px-3.5 py-2.5 text-base md:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-300 focus:border-zinc-800 focus:bg-white/40 focus:shadow-[0_4px_12px_rgba(0,0,0,0.02)] disabled:opacity-50"
                placeholder="Describe your project or idea..."
              />
            </label>
            <div className="mt-4 flex flex-col gap-2">
              <RippleButton
                type="submit"
                disabled={formStatus === 'submitting' || formStatus === 'success'}
                className="bg-zinc-900 hover:bg-zinc-800 text-white border border-transparent px-4 py-2.5 text-[9.5px] sm:text-[10px] rounded-xl uppercase tracking-[0.25em] disabled:opacity-50 w-full sm:w-auto self-start"
              >
                {formStatus === 'submitting' ? 'Sending...' : formStatus === 'success' ? 'Sent!' : 'Send Message'}
              </RippleButton>

              {/* Monospaced Log Output */}
              {formStatus !== 'idle' && (
                <div className="mt-2.5 p-3 rounded-xl bg-zinc-900 text-zinc-200 font-mono text-[9.5px] sm:text-[10.5px] border border-zinc-800 flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${formStatus === 'submitting' ? 'bg-amber-400 animate-pulse' : formStatus === 'success' ? 'bg-emerald-400 animate-ping' : 'bg-red-400 animate-pulse'}`} />
                  <div>
                    {formStatus === 'submitting' && (
                      <span className="text-amber-400">[ SYSTEM // SENDING_REQUEST... ]</span>
                    )}
                    {formStatus === 'success' && (
                      <span className="text-emerald-400">[ SUCCESS // MESSAGE_DELIVERED_STABLE ]</span>
                    )}
                    {formStatus === 'error' && (
                      <span className="text-red-400">[ ERROR // FAILED_TO_TRANSMIT ]</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
