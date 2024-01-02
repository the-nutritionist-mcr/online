import Heading from "@theme/Heading";
import clsx from "clsx";
import styles from "./button.module.css";
import Link from "@docusaurus/Link";

interface StartingButtonProps {
  title: string;
  description: string;
  url: string;
}

export const StartingButton = ({
  description,
  title,
  url,
}: StartingButtonProps) => {
  return (
    <div className={clsx("col col--5")}>
      <div className="text--center padding-vert--lg">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <div className={styles.button}>
          <Link className="button button--secondary button--lg" to={url}>
            Go
          </Link>
        </div>
      </div>
    </div>
  );
};
