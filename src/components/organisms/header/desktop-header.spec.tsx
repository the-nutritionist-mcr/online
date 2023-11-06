import { render, screen } from "@testing-library/react";
import DesktopHeader from "./desktop-header";

describe("The desktop header", () => {
  it("renders without an error", () => {
    render(<DesktopHeader />);
  });

  it("contains an Our Story link", () => {
    render(<DesktopHeader />);

    expect(screen.getByRole("link", { name: "Our Story" })).toHaveAttribute(
      "href",
      expect.stringContaining("/our-story/")
    );
  });
});
