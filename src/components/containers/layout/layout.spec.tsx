import Layout from "./layout";
import { render, screen } from "../../test-support";
import { ReactNode, useContext } from "react";
import { UserContext } from "../../contexts";
import userEvent from "@testing-library/user-event";

vi.mock("@tnmo/components", () => ({
  Loader: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("the layout component", () => {
  it("renders without errors", () => {
    render(<Layout>Something</Layout>);
  });

  it("renders its children", () => {
    render(
      <Layout>
        <p>Child Node</p>
      </Layout>
    );

    expect(screen.queryByText("Child Node")).toBeInTheDocument();
  });
});
