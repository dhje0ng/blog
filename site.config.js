const notionPageId = process.env.NOTION_PAGE_ID ?? "";

const siteConfig = {
  blog: {
    title: "DH.J",
    description: "DH.J Blog",
    language: "ko"
  },
  profile: {
    name: "Donghyeon Jeong",
    handle: "@dhjeong",
    intro: "Cyber Security Engineer",
    avatar: "https://avatars.githubusercontent.com/u/9919?v=4"
  },
  social: {
    github: "https://github.com/dhje0ng",
    linkedin: "https://www.linkedin.com/in/donghyeon-jeong-87a274214",
    x: "https://x.com/#",
    email: "mailto:dhje0ng@naver.com"
  },
  notion: {
    notion_page_id: notionPageId
  }
};

module.exports = siteConfig;
