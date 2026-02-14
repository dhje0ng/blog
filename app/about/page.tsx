import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import siteConfig from "@/site.config";

const featuredProjects = [
  {
    title: "Threat Intelligence Dashboard",
    description: "침해 지표를 수집/정규화해 보안 운영팀이 실시간으로 위협 레벨을 파악할 수 있는 내부 대시보드.",
    stack: ["Next.js", "TypeScript", "Elasticsearch"]
  },
  {
    title: "Notion Publishing Pipeline",
    description: "노션 문서를 콘텐츠로 자동 배포하고 메타데이터/검색 인덱스를 동기화하는 퍼블리싱 파이프라인.",
    stack: ["Node.js", "Notion API", "Vercel"]
  },
  {
    title: "Incident Response Playbook",
    description: "침해 사고 대응 절차를 템플릿화해 탐지-분석-조치 단계를 빠르게 실행할 수 있도록 만든 플레이북 세트.",
    stack: ["SIEM", "Automation", "Docs"]
  }
];

const capabilities = ["Cloud Security", "Threat Hunting", "Application Security", "Automation", "Incident Response", "Technical Writing"];

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
              {siteConfig.profile.intro}로 활동하며 보안/개발 사이의 간극을 줄이는 실용적인 아키텍처를 설계합니다. 운영 가능한 자동화와
              이해하기 쉬운 문서를 함께 만드는 것을 중요하게 생각합니다.
            </p>
            <div className="about-hero-actions">
              <Link href="/articles" className="about-action-primary">
                아티클 보러가기
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
            <h2>Experience Snapshot</h2>
            <ul className="about-timeline">
              <li>
                <span>2025</span>
                <p>개인 기술 블로그 정보 구조 리뉴얼 및 검색 경험 개선</p>
              </li>
              <li>
                <span>2024</span>
                <p>노션 기반 콘텐츠 자동 배포 파이프라인 구축</p>
              </li>
              <li>
                <span>2023</span>
                <p>보안 이벤트 분석 및 위협 탐지 룰 고도화 프로젝트 수행</p>
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
            <h2>Featured Work</h2>
            <p>최근 집중하고 있는 작업들</p>
          </div>
          <div className="about-project-grid">
            {featuredProjects.map((project) => (
              <article key={project.title} className="about-project-card">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="about-stack-list">
                  {project.stack.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
