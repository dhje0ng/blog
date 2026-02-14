declare const siteConfig: {
  blog: {
    title: string;
    description: string;
    language: string;
  };
  profile: {
    name: string;
    handle: string;
    intro: string;
    avatar: string;
  };
  social: Record<string, string>;
  notion: {
    notion_page_id: string;
  };
};

export default siteConfig;
