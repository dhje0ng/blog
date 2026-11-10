const notionPageId = process.env.NOTION_PAGE_ID ?? "";

const siteConfig = {
  blog: {
    title: "JDH",
    description: "JDH - Technology Blog",
    language: "ko"
  },
  profile: {
    name: "Donghyeon Jeong",
    handle: "@dhje0ng",
    intro: "Security Researcher",
    avatar: "/blog/IMG_5214.jpeg",
    aboutMeUrl: "https://dhjeong.kr/"
  },
  social: {
    github: "https://github.com/dhje0ng",
    linkedin: "https://www.linkedin.com/in/donghyeon-jeong-87a274214",
    email: "mailto:dhje0ng@naver.com"
  },
  notion: {
    notion_page_id: notionPageId
  }
};

module.exports = siteConfig;
