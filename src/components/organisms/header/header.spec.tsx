import Header from "./header";
import MobileHeader from "./mobile-header";
import DesktopHeader from "./desktop-header";
import { useBreakpoints } from "../../hooks";
import { mocked } from "jest-mock";
import { render, shallow } from "enzyme";

vi.mock("../../hooks");

describe("The <Header> component", () => {
  it("renders without errors", () => {
    render(<Header admin={false} />);
  });
});
