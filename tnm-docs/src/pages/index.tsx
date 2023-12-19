import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import { StartingButton } from "@site/src/components";

import Heading from "@theme/Heading";
import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

const sections = [
  {
    title: "Application",
    description: "Everything about the TNM portal application",
    url: "docs/category/application",
  },
  {
    title: "The Business",
    description: "Information about the TNM business",
    url: "docs/category/the-business",
  },
];

export default function Home() {
  const context = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${context.siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <div className="container">
          <div className={`row ${styles.buttons}`}>
            {sections.map((section, index) => (
              <StartingButton key={index} {...section} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
