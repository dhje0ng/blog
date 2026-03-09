import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import siteConfig from "@/site.config";

const featuredProjects = [
  {
    title: "USB Fuzzing in Vehicles: Discovering Real-World Vulnerabilities",
    description:
      "Performed real-world automotive penetration testing through USB device fuzzing and identified critical infotainment vulnerabilities.",
    publishedDate: "Aug 09, 2023",
    references: ["DEFCON 31 Car Hacking Village"]
  }
];

const disclosureVulnerabilities = [
  {
    cveId: "CVE-2023-39076",
    description:
      "Discovered a DoS vulnerability in the GM Equinox infotainment system triggered by malformed USB data input.",
    target: "General Motors",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2023-39076"]
  },
  {
    cveId: "CVE-2023-39075",
    description:
      "Discovered a DoS vulnerability in the Renault ZOE infotainment system triggered by malformed USB data input.",
    target: "Renault Group",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2023-39075"]
  },
  {
    cveId: "CVE-2022-[REDACTED]",
    description:
      "Discovered a DoS vulnerability in the BMW infotainment system triggered by malformed data input.",
    target: "BMW Automotive",
    references: ["https://www.bmwgroup.com/en/general/Security.html"]
  }
];

const featuredCompetitions = [
  {
    title: "Automotive CTF 2024",
    date: "Oct 21, 2024",
    result: "3rd place (Team JJJJJ)",
    location: "Detroit, USA",
    organizer: "Vicone & Blockharbor Cybersecurity"
  },
  {
    title: "Car Hacking Village CTF 2024",
    date: "Aug 09, 2024",
    result: "4th place (Team AUTOCRYPT)",
    location: "Las Vegas, USA",
    organizer: "Car Hacking Village, DEF CON"
  },
  {
    title: "Car Hacking Village CTF 2023",
    date: "Aug 09, 2023",
    result: "4th place (Team AUTOCRYPT)",
    location: "Las Vegas, USA",
    organizer: "Car Hacking Village, DEF CON"
  },
  {
    title: "Car Hacking Village CTF 2022",
    date: "Aug 09, 2022",
    result: "5th place (Team AUTOCRYPT)",
    location: "Las Vegas, USA",
    organizer: "Car Hacking Village, DEF CON"
  },
  {
    title: "Cyber Security Challenge",
    date: "Aug ~ Nov 2021",
    result: "1st place (Team AUTOCRYPT)",
    location: "Seoul, South Korea",
    organizer: "Ministry of Science and ICT"
  },
  {
    title: "KOSPO Web Service Security Competition",
    date: "Aug 2021",
    result: "Honorable Mention (Team 고점에사람있어요)",
    location: "Seoul, South Korea",
    organizer: "KOSPO"
  },
  {
    title: "Y-CTF 2018",
    date: "Nov 2018",
    result: "1st place (Team 김봉혁의 빠루교실)",
    location: "Seoul, South Korea",
    organizer: "Yeungnam University College"
  }
];

const capabilities = ["Penetration Testing", "Vulnerability Research", "Automotive Security", "Exploit Validation"];

const quickStats = [
  { label: "Disclosed CVEs", value: "3+" },
  { label: "CTF Awards", value: "7" },
  { label: "Primary Focus", value: "Automotive" }
];

export default function AboutPage() {
  return (
    <main>
      <Header />
      <section className="container top-gap section-gap about-page about-gh-theme">
        <div className="about-hero-card">
          <div>
            <p className="eyebrow">About</p>
            <h1>{siteConfig.profile.name}</h1>
            <p className="about-hero-copy">
              Hi, I&apos;m a cybersecurity researcher based in South Korea. My work focuses on automotive security,
              practical penetration testing, and vulnerability discovery. I enjoy turning complex attack surfaces
              into clear defensive improvements through repeatable research and validation.
            </p>
            <div className="about-stat-grid">
              {quickStats.map((stat) => (
                <article key={stat.label} className="about-stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
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
            <Image
              src={siteConfig.profile.avatar}
              alt={`${siteConfig.profile.name} portrait`}
              width={320}
              height={360}
              className="about-portrait"
              priority
            />
          </div>
        </div>

        <section className="about-grid-section">
          <article className="about-panel">
            <div className="about-section-head">
              <span>Background</span>
              <h2>Education</h2>
            </div>
            <ul className="about-timeline">
              <li>
                <span>Mar 2018 ~ Feb 2022</span>
                <div className="about-timeline-content">
                  <p>Yeungnam University College</p>
                  <p>
                    <small>B.S. in Cybersecurity</small>
                  </p>
                </div>
              </li>
              <li>
                <span>Jul 2020 ~ Mar 2021</span>
                <div className="about-timeline-content">
                  <p>Best of the Best, KITRI</p>
                  <p>
                    <small>Completed the Security Development Track</small>
                  </p>
                </div>
              </li>
            </ul>
          </article>

          <article className="about-panel">
            <div className="about-section-head">
              <span>Career</span>
              <h2>Work Experience</h2>
            </div>
            <ul className="about-timeline">
              <li>
                <span>Jan 2025 ~ Present</span>
                <div className="about-timeline-content">
                  <p>ROK GOC/GCC (Ground Operations Command)</p>
                  <p>
                    <small>Security Analyst (Malware, Vulnerability)</small>
                  </p>
                </div>
              </li>
              <li>
                <span>Jun 2021 ~ Dec 2024</span>
                <div className="about-timeline-content">
                  <p>AUTOCRYPT, Red Team</p>
                  <p>
                    <small>Vehicle Cybersecurity Researcher</small>
                  </p>
                </div>
              </li>
            </ul>
          </article>

          <article className="about-panel about-panel-full-width">
            <div className="about-section-head">
              <span>Expertise</span>
              <h2>Capabilities</h2>
            </div>
            <div className="about-skill-cloud">
              {capabilities.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </article>
        </section>

        <section className="about-panel">
          <div className="about-section-head">
            <span>Highlights</span>
            <h2>Talk / Speaker</h2>
          </div>
          <div className="about-project-grid">
            {featuredProjects.map((project) => (
              <article key={project.title} className="about-project-card about-talk-card">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="about-project-meta">
                  <p>
                    <strong>Published</strong>
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
          <div className="about-section-head">
            <span>Achievements</span>
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

        <section className="about-panel">
          <div className="about-section-head">
            <span>Security Research</span>
            <h2>Disclosed Vulnerabilities</h2>
          </div>
          <div className="about-project-grid">
            {disclosureVulnerabilities.map((item) => (
              <article key={item.cveId} className="about-project-card about-disclosure-card">
                <h3>{item.cveId}</h3>
                <p>{item.description}</p>
                <div className="about-project-meta">
                  <p>
                    <strong>Target (OEM)</strong>
                    <span>{item.target}</span>
                  </p>
                  <div className="about-disclosure-references">
                    <strong>References</strong>
                    <ul>
                      {item.references.map((reference) => (
                        <li key={reference}>
                          <a href={reference} target="_blank" rel="noreferrer">
                            {reference}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
