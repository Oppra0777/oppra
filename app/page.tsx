import Image from "next/image";
import planImage from "../public/Frame 1000003270.png";
import offlineImage from "../public/Frame 1000003277.png";
import reportImage from "../public/Frame 15.png";
import splashScreen from "../public/splash.png";
import tasksScreen from "../public/Task.png";
import brandArt from "../public/oppra-splash-blue-1080x1920-2 (1) 1.png";
import { Brand } from "./_components/brand";
import { Icon } from "./_components/icon";
import { WaitlistForm } from "./_components/waitlist-form";
import { ScrollReveal } from "./_components/scroll-reveal";
import { PageNavigation } from "./_components/page-navigation";
import { HeroMotion } from "./_components/hero-motion";
import { MobileNav } from "./_components/mobile-nav";
import { WaitlistVideo } from "./_components/waitlist-video";
import { FaqItem } from "./_components/faq-item";
import { getCountries } from "./_lib/waitlist";

const features = [
  {
    number: "01",
    icon: "tasks" as const,
    title: "Less juggling. More doing.",
    description: "Bring tasks, people, and progress together. Give everyone clarity on what needs to happen next.",
    image: planImage,
    alt: "Oppra illustration of teammates working together on a task list",
    label: "PLAN & COLLABORATE",
  },
  {
    number: "02",
    icon: "offline" as const,
    title: "Off the grid. Still in sync.",
    description: "Keep work moving wherever the day takes you. Complete tasks offline and sync when you're connected again.",
    image: offlineImage,
    alt: "Oppra illustration of an offline cloud surrounded by teammates",
    label: "WORK ANYWHERE",
  },
  {
    number: "03",
    icon: "report" as const,
    title: "Good work. Clear proof.",
    description: "Turn updates into a clear picture of progress, with structured reports, photos, and documents in one place.",
    image: reportImage,
    alt: "Oppra illustration showing connected teams, inbox, logs, and tasks",
    label: "REPORT WITH CLARITY",
  },
];

const questions = [
  {
    question: "What is Oppra?",
    answer: "Oppra is a mobile-first platform for team and field operations. It brings task management, team coordination, and structured reporting into one shared workspace, with offline support for work beyond the office.",
  },
  {
    question: "Who is Oppra built for?",
    answer: "Oppra is for teams that need to coordinate people and work across locations — from field teams and growing businesses to nonprofits and project teams.",
  },
  {
    question: "What happens when I join the waitlist?",
    answer: "We'll save your place and contact you by email with launch updates and access details when Oppra is ready. Joining the waitlist is free and doesn't commit you to a paid plan.",
  },
  {
    question: "When will Oppra launch?",
    answer: "We're getting things ready and haven't announced a launch date yet. Join the waitlist to hear from us when we have news to share.",
  },
];

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <PageNavigation />
      <a className="skip-link" href="#main">Skip to content</a>
      <header id="top" className="site-header">
        <div className="container header-inner">
          <a href="#" aria-label="Oppra home"><Brand /></a>
          <nav aria-label="Main navigation">
            <a href="#why-oppra">Why Oppra</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faqs">FAQs</a>
          </nav>
          <a href="#waitlist" className="button button-small">Join the waitlist <Icon name="arrow" /></a>
          <MobileNav />
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="announcement"><span className="status-dot" /> A better way to work is coming</span>
              <h1 id="hero-title">
                <span className="hero-line"><span>Your team.</span></span>
                <span className="hero-line"><span>Your work.</span></span>
                <span className="hero-line hero-highlight"><span>One loop.</span></span>
                <svg className="headline-loop" viewBox="0 0 340 22" fill="none" aria-hidden="true"><path d="M5 16C80 2 224 0 330 11M46 20c78-9 176-10 248-6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
              </h1>
              <p className="hero-description">Great work happens when everyone is connected. Bring your tasks, teams, and reports together — wherever work takes you.</p>
              <div className="hero-actions">
                <a className="button" href="#waitlist">Get early access <Icon name="arrow" /></a>
                <a className="text-link" href="#meet-oppra">Meet Oppra <span className="play-icon"><Icon name="play" /></span></a>
              </div>
              <div className="hero-note"><span className="tiny-check"><Icon name="check" /></span> Free to join <span className="note-divider" /> Be first in the loop</div>
            </div>

            <HeroMotion>
              <div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <span className="visual-spark spark-one" aria-hidden="true">✳</span>
              <div className="phone phone-back">
                <Image src={splashScreen} alt="Oppra welcome screen: Your team. One loop." sizes="240px" placeholder="blur" preload />
              </div>
              <div className="phone phone-front">
                <Image src={tasksScreen} alt="Oppra tasks screen with task statuses, teammates, and a task board" sizes="(max-width: 600px) 205px, 252px" placeholder="blur" preload />
              </div>
              <div className="preview-label"><span /> A little preview of what&apos;s coming</div>
            </HeroMotion>
          </div>
          <div className="container audience-strip">
            <p>BUILT FOR TEAMS THAT MAKE THINGS HAPPEN</p>
            <div><span><Icon name="location" /> Field teams</span><span><Icon name="business" /> Growing businesses</span><span><Icon name="heart" /> Nonprofits</span><span><Icon name="team" /> Project teams</span></div>
          </div>
        </section>

        <section id="meet-oppra" className="video-section section-space" aria-labelledby="video-title">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">A THIRTY-SIX SECOND TOUR</span>
              <h2 id="video-title">Press play.<br /><span>See it all connect.</span></h2>
              <p>Tasks, teams, and reports coming together —<br className="desktop-break" /> and staying in sync when the signal drops.</p>
            </div>
            <WaitlistVideo />
          </div>
        </section>

        <section id="why-oppra" className="features section-space" aria-labelledby="features-title">
          <div className="container">
            <div className="section-heading"><span className="eyebrow">LESS FRICTION. MORE FORWARD.</span><h2 id="features-title">Everything connected.<br /><span>Everyone moving.</span></h2><p>From the first task to the final report,<br className="desktop-break" /> keep the whole team on the same page.</p></div>
            <div className="feature-grid">
              {features.map((feature) => (
                <article className="feature-card" key={feature.number}>
                  <div className="feature-art"><Image src={feature.image} alt={feature.alt} sizes="(max-width: 700px) 400px, 360px" placeholder="blur" /><span className="feature-number">{feature.number}</span></div>
                  <div className="feature-copy"><span className="feature-label"><Icon name={feature.icon} />{feature.label}</span><h3>{feature.title}</h3><p>{feature.description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-section section-space" aria-labelledby="how-title">
          <div className="container how-grid">
            <div><span className="eyebrow">A LITTLE LESS BUSYWORK</span><h2 id="how-title">More room for<br />the work that matters.</h2><p className="section-description">One connected workflow. From making a plan to making an impact.</p><a href="#waitlist" className="text-link blue-link">Be part of what&apos;s next <Icon name="arrow" /></a></div>
            <ol className="steps">
              <li><span className="step-number">01</span><div><h3>Bring your people together</h3><p>Give your team a shared space to connect, coordinate, and know what&apos;s next.</p></div><Icon name="team" /></li>
              <li><span className="step-number">02</span><div><h3>Turn plans into progress</h3><p>Assign tasks, keep track of the details, and get work done — even offline.</p></div><Icon name="tasks" /></li>
              <li><span className="step-number">03</span><div><h3>Keep everyone in the loop</h3><p>Share updates and clear reports, so good work never gets lost in the noise.</p></div><Icon name="report" /></li>
            </ol>
          </div>
        </section>

        <section id="waitlist" className="waitlist-section section-space" aria-labelledby="waitlist-title">
          <div className="container waitlist-grid">
            <div className="waitlist-story">
              <span className="eyebrow"><span className="status-dot" /> THE NEXT CHAPTER STARTS WITH YOU</span>
              <h2>Good things<br />are coming.<br /><span>Get in the loop.</span></h2>
              <p>We&apos;re building a simpler way for teams to work together. Be among the first to experience Oppra.</p>
              <ul className="waitlist-perks"><li><Icon name="check" /> Hear about launch first</li><li><Icon name="check" /> Get updates on early access</li><li><Icon name="check" /> Help shape what comes next</li></ul>
              <div className="waitlist-brand-art"><Image src={brandArt} alt="" sizes="135px" /><span>Your team. One loop.<br /><strong>And you&apos;re part of it.</strong></span></div>
              <span className="story-orbit" aria-hidden="true" />
            </div>
            <div className="waitlist-form-panel"><span className="form-kicker">YOUR NEXT CHAPTER</span><h2 id="waitlist-title">Join the Oppra Waitlist</h2><p className="form-intro">A few details now. A better way to work soon.</p><WaitlistForm countries={getCountries()} /></div>
          </div>
        </section>

        <section id="faqs" className="faq-section section-space" aria-labelledby="faq-title">
          <div className="container faq-grid"><div><span className="eyebrow">A FEW THINGS TO KNOW</span><h2 id="faq-title">Glad you asked.</h2><p className="section-description">A little more about Oppra<br />and what&apos;s coming.</p></div><div className="faq-list">{questions.map(({ question, answer }) => <FaqItem key={question} question={question} answer={answer} />)}</div></div>
        </section>
      </main>

      <footer className="site-footer"><div className="container footer-top"><a href="#" aria-label="Oppra home"><Brand /></a><p>Your team. One loop.</p><a href="#waitlist" className="text-link">Let&apos;s stay in the loop <Icon name="arrow" /></a></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Oppra. All rights reserved.</span><span>Made for the way teams really work.</span></div></footer>
    </>
  );
}
