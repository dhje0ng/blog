import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import siteConfig from "@/site.config";

const featuredProjects = [
  {
    title: "How to USB Fuzzing in vehicles to discover the real world vulnerability",
    description: "Performed real-world automotive penetration testing through USB device fuzzing, successfully identifying critical vulnerabilities",
    publishedDate: "Aug 09, 2023",
    references: ["DEFCON 31 Car Hacking Village"]
  },
];

const featuredCompetitions = [
  {
    title: "Your Competition Title",
    date: "YYYY.MM.DD",
    result: "1st Place",
    location: "Detroit, USA",
    organizer: "Blockharbor Cybersecurity"
  }
];

const capabilities = ["Penetration Testing", "Vulnerability Research"];

export default function AboutPage() {
  return (
    <main>
      <Header />
      <section className="container top-gap section-gap about-page">
        <div className="about-hero-card">
          <div>
            <p className="eyebrow">About</p>
            <h1>{siteConfig.profile.name}</h1>
            <p className="about-hero-copy">
              Hi, I’m a cybersecurity researcher from the Republic of Korea. 
              Most of my work centers around automotive cybersecurity, protecting vehicles from potential attacks.
              I’m also passionate about finding and fixing software vulnerabilities through bug hunting. ✅ 
              
              Always curious, I love learning from every challenge I face 😄
            </p>
            <div className="about-hero-actions">
              <Link href="/articles" className="about-action-primary">
                View Articles
              </Link>
              <a href={siteConfig.social.linkedin} target="_blank" rel="noreferrer" className="about-action-secondary">
                LinkedIn
              </a>
            </div>
          </div>
          <div className="about-profile-wrap">
            <Image src={siteConfig.profile.avatar} alt={`${siteConfig.profile.name} portrait`} width={320} height={360} className="about-portrait" />
          </div>
        </div>

        <section className="about-grid-section">
          <article className="about-panel">
            <h2>Education</h2>
            <ul className="about-timeline">
              <li>
                <span>Mar 2018 ~ Feb 2022</span>
                <div className="about-timeline-content">
                  <p>Yeungnam University Collage</p>
                  <p><small>Graduated from the Depts, Cybersecurity</small></p>
                </div>
              </li>
              <li>
                <span>July 2020 - Mar 2021</span>
                <div className="about-timeline-content">
                  <p>Best of the Best, KITRI</p>
                  <p><small>Completed the Security Development Track</small></p>
                </div>
              </li>
            </ul>
          </article>

          <article className="about-panel">
            <h2>Work Experience</h2>
            <ul className="about-timeline">
              <li>
                <span>Jan 2025 ~ Present</span>
                <div className="about-timeline-content">
                  <p>ROK GOC/GCC (Ground Operations Command)</p>
                  <p><small>Security Analyst (Malware, Vulnerability)</small></p>
                </div>
              </li>
              <li>
                <span>Jun 2021 - Dec 2024</span>
                <div className="about-timeline-content">
                  <p>Autocrypt, Redteam</p>
                  <p><small>Vehicle Cybersecurity Researcher</small></p>
                </div>
              </li>
            </ul>
          </article>

          <article className="about-panel">
            <h2>Capabilities</h2>
            <div className="about-skill-cloud">
              {capabilities.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </article>
        </section>

        <section className="about-panel">
          <div className="section-title-row">
            <h2>Talk/Speaker</h2>
          </div>
          <div className="about-project-grid">
            {featuredProjects.map((project) => (
              <article key={project.title} className="about-project-card about-talk-card">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="about-project-meta">
                  <p>
                    <strong>Published Date</strong>
                    <span>{project.publishedDate}</span>
                  </p>
                  <p>
                    <strong>References</strong>
                    <span>{project.references.join(", ")}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-panel">
          <div className="section-title-row">
            <h2>Competition</h2>
          </div>
          <div className="about-project-grid">
            {featuredCompetitions.map((competition) => (
              <article key={competition.title} className="about-project-card about-competition-card">
                <h3>{competition.title}</h3>
                <div className="about-project-meta">
                  <p>
                    <strong>Date</strong>
                    <span>{competition.date}</span>
                  </p>
                  <p>
                    <strong>Result</strong>
                    <span>{competition.result}</span>
                  </p>
                  <p>
                    <strong>Location</strong>
                    <span>{competition.location}</span>
                  </p>
                  <p>
                    <strong>Organizer</strong>
                    <span>{competition.organizer}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
