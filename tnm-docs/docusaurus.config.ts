import type { Config, ThemeConfig } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

import { themes as prismThemes } from "prism-react-renderer";

const presets: [string, Preset.Options][] = [
  [
    "classic",
    {
      docs: {
        sidebarPath: "./sidebars.js",
        editUrl:
          "https://github.com/the-nutritionist-mcr/online/blob/main/tnm-docs",
      },
      blog: false,
      theme: {
        customCss: "./src/css/custom.css",
      },
    },
  ],
];

const themeConfig: Preset.ThemeConfig = {
  image: "img/docusaurus-social-card.jpg",
  navbar: {
    title: "TNM",
    logo: {
      alt: "My Site Logo",
      src: "img/logo.svg",
    },
    items: [
      {
        type: "docSidebar",
        sidebarId: "tutorialSidebar",
        position: "left",
        label: "Docs",
      },
      {
        href: "https://github.com/the-nutritionist-mcr/online/tree/main/tnm-docs",
        label: "GitHub",
        position: "right",
      },
    ],
  },
  footer: {
    style: "dark",
    links: [
      {
        title: "Docs",
        items: [
          {
            label: "Technical Documentation",
            to: "/docs/category/technical-documentation",
          },
        ],
      },
    ],
  },
  prism: {
    theme: prismThemes.github,
    darkTheme: prismThemes.dracula,
  },
};

const config: Config = {
  presets,
  themeConfig,

  themes: ["@docusaurus/theme-mermaid"],
  title: "TNM Documentation",
  favicon: "img/favicon.ico",
  url: "https://the-nutritionist-mcr.github.io/",
  baseUrl: "/",
  organizationName: "the-nutritionist-mcr",
  projectName: "online",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    mermaid: true,
  },
};

export default config;
