const siteConfig = {
  blog: {
    title: "N-Blog",
    description: "Next.js + Notion 기반의 화이트톤 GitHub 스타일 블로그",
    language: "ko"
  },
  profile: {
    name: "Donghyeon Jeong",
    handle: "@dhjeong",
    intro: "개발과 디자인, 생산성을 기록합니다.",
    avatar: "https://avatars.githubusercontent.com/u/9919?v=4"
  },
  social: {
    github: "https://github.com/dhje0ng",
    linkedin: "https://www.linkedin.com/in/dhje0ng",
    x: "https://x.com/dhje0ng",
    email: "mailto:dhje0ng@gmail.com"
  },
  notion: {
    notion_page_id: process.env.NOTION_PAGE_ID ?? process.env.NOTION_DATABASE_ID ?? ""
  }
};

module.exports = siteConfig;
