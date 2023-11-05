import { when } from 'jest-when';
import {
  AuthenticationServiceContext,
  AuthenticationContextType,
} from '../organisms/login-and-register-box/authentication-service-context';

import React from 'react';
import { NavigationContext, NavigationContextType } from '@tnmo/utils';

export const mockDependencies = (
  dependencies?: AuthenticationContextType & NavigationContextType
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useContext = vi.spyOn(React, 'useContext') as any;
  const deps = {
    register: vi.fn(),
    login: vi.fn(),
    newPasswordChallengeResponse: vi.fn(),
    confirmSignup: vi.fn(),
    navigate: vi.fn(),
    ...(dependencies ?? []),
  };

  when<AuthenticationContextType, [typeof AuthenticationServiceContext]>(
    useContext
  )
    .calledWith(AuthenticationServiceContext)
    .mockReturnValue(deps);

  when<NavigationContextType, [typeof NavigationContext]>(useContext)
    .calledWith(NavigationContext)
    .mockReturnValue(deps);
};
