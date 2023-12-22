import { render } from "@testing-library/react";
import TnmApp from "./_app.page";
import { Router } from "next/router";
import { mock } from "vitest-mock-extended";
import { screen } from "@testing-library/react";
import { getAppConfig } from "@tnmo/core";

// eslint-disable-next-line unicorn/prefer-module
vi.mock("next/router", () => require("next-router-mock"));
vi.mock("@tnmo/core");
vi.mock("../aws/authenticate");

beforeEach(() => {
  vi.mocked(getAppConfig).mockResolvedValue({
    DomainName: "foo",
    UserPoolId: "pool-id",
    AwsRegion: "eu-west-2",
    Environment: "test",
    ChargebeeUrl: "url",
    ClientId: "client-id",
    ApiDomainName: "locahost",
  });
});

test("the app page renders correctly without error when passed a component", () => {
  const component = () => <></>;
  const mockRouter = mock<Router>();

  render(<TnmApp router={mockRouter} pageProps={{}} Component={component} />);
});

test("the app page renders the component that was passed to it", () => {
  const component = () => <>Hello!</>;
  const mockRouter = mock<Router>();

  render(<TnmApp router={mockRouter} pageProps={{}} Component={component} />);

  expect(screen.queryByText("Hello!")).toBeTruthy();
});
