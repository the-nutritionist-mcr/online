import {
  AuthenticationServiceContext,
  AuthenticationContextType,
} from "../organisms/login-and-register-box/authentication-service-context";

import React, { createContext, useContext, ReactNode } from "react";
import { NavigationContext, NavigationContextType } from "@tnmo/utils";

export const mockDependencies = (
  dependencies?: AuthenticationContextType & NavigationContextType
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deps = {
    register: vi.fn(),
    login: vi.fn(),
    newPasswordChallengeResponse: vi.fn(),
    confirmSignup: vi.fn(),
    navigate: vi.fn(),
    forgotPassword: vi.fn(),
    ...(dependencies ?? []),
  };

  return ({ children }: { children: ReactNode }) => (
    <AuthenticationServiceContext.Provider value={deps}>
      <NavigationContext.Provider value={deps}>
        {children}
      </NavigationContext.Provider>
    </AuthenticationServiceContext.Provider>
  );
};
