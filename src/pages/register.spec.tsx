import { render } from '@testing-library/react';
import {
  AuthenticationServiceContext,
  AuthenticationContextType,
} from '@tnmo/components';
import { ThemeProvider } from '@emotion/react';
import Register from './register.page';
import { theme } from '../theme';
import { mock } from 'jest-mock-extended';
import { NavigationContext, NavigationContextType } from '@tnmo/utils';

const mockNavigation = mock<NavigationContextType>();
const mockAuthService = mock<AuthenticationContextType>();

test('Renders without error', async () => {
  render(
    <AuthenticationServiceContext.Provider value={mockAuthService}>
      <NavigationContext.Provider value={mockNavigation}>
        <ThemeProvider theme={theme}>
          <Register />
        </ThemeProvider>
      </NavigationContext.Provider>
    </AuthenticationServiceContext.Provider>
  );
});
