import React from "react";
import { AuthenticationServiceContext } from "./authentication-service-context";

import { render, act, screen } from "@testing-library/react";
import { ThemeProvider, Theme } from "@emotion/react";

import userEvent from "@testing-library/user-event";
import LoginAndRegisterBox from "./login-and-register-box";
import { NavigationContext } from "@tnmo/utils";

const theme: Theme = {
  colors: {
    buttonBlack: "black",
    labelText: "black",
  },
  menubarHeight: 100,
  breakpoints: {
    small: {
      end: 400,
    },
    medium: {
      start: 401,
      end: 900,
    },
    large: {
      start: 601,
    },
  },
};

const mockAuthServices = {
  register: vi.fn(),
  login: vi.fn(),
  newPasswordChallengeResponse: vi.fn(),
  confirmSignup: vi.fn(),
  forgotPassword: vi.fn(),
};

describe("The login and register box", () => {
  it("renders without error", () => {
    render(
      <ThemeProvider theme={theme}>
        <NavigationContext.Provider value={{ navigate: vi.fn() }}>
          <AuthenticationServiceContext.Provider value={mockAuthServices}>
            <LoginAndRegisterBox defaultTab="Login" />
          </AuthenticationServiceContext.Provider>
        </NavigationContext.Provider>
      </ThemeProvider>
    );
  });

  it("Changes the history bar if you click on a tab", async () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");
    render(
      <ThemeProvider theme={theme}>
        <NavigationContext.Provider value={{ navigate: vi.fn() }}>
          <AuthenticationServiceContext.Provider value={mockAuthServices}>
            <LoginAndRegisterBox defaultTab="Login" />
          </AuthenticationServiceContext.Provider>
        </NavigationContext.Provider>
      </ThemeProvider>
    );

    const registerTab = screen.getByRole("tab", { name: "Register" });

    await userEvent.click(registerTab);

    // eslint-disable-next-line unicorn/no-null
    expect(replaceStateSpy).toBeCalledWith(null, "", "/register/");
  });
});
