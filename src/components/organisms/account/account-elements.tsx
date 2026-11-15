import { FC } from "react";
import { header } from "../../containers/form-section/form-section.css";
import { text } from "./account.css";

interface ContentProps {
  children: React.ReactNode;
}

export const Section: FC<ContentProps> = ({ children }) => (
  <section className="mt-8 grid gap-4">{children}</section>
);

export const Header: FC<ContentProps> = ({ children }) => (
  <h2
    className={`${header} !mb-0 border-b border-dashed border-[#b8b8b8] pb-4`}
  >
    {children}
  </h2>
);

export const TextBlock: FC<ContentProps> = ({ children }) => (
  <p className={text}>{children}</p>
);
