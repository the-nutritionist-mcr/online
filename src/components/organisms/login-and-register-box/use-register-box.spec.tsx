import { act, renderHook } from "@testing-library/react-hooks";
import { mockDependencies } from "../../test-support";
import { RegisterFormData } from "./types/srp-data";
import { RegisterResponse } from "./types/register";
import { mock } from "vitest-mock-extended";
import { when } from "jest-when";
import { mocked } from "jest-mock";
import { RegisterState, useRegisterBox } from "./use-register-box";

afterEach(() => vi.clearAllMocks());

test("Has a default registerState of DoRegister", () => {
  const wrapper = mockDependencies();
  const { result } = renderHook(() => useRegisterBox(), { wrapper });

  expect(result.current.registerState).toEqual(RegisterState.DoRegister);
});

test("Sets the registerState to confirmMobile when the response indicates the need to confirm", async () => {
  const signupResult = mock<RegisterResponse>();
  signupResult.userConfirmed = false;
  const register = vi.fn();
  register.mockResolvedValue(signupResult);

  const wrapper = mockDependencies({ register });
  const mockData = mock<RegisterFormData>();

  const { result } = renderHook(() => useRegisterBox(), { wrapper });

  await act(async () => result.current.onSubmit(mockData));

  expect(result.current.registerState).toEqual(RegisterState.ConfirmMobile);
});

test("Sets an error message if an error is thrown by register", async () => {
  const register = vi.fn();

  register.mockRejectedValue(new Error("AN ERROR!"));

  const wrapper = mockDependencies({ register });
  const { result } = renderHook(() => useRegisterBox(), { wrapper });

  const mockData = mock<RegisterFormData>();

  await act(async () => result.current.onSubmit(mockData));

  expect(result.current.errorMessage).toEqual({ message: "AN ERROR!" });
});

test("Sets an error message if an error is thrown by confirmSignup", async () => {
  const signupResult = mock<RegisterResponse>();
  signupResult.userConfirmed = false;
  const register = vi.fn();
  register.mockResolvedValue(signupResult);

  mocked(register).mockResolvedValue(signupResult);
  const mockRegisterData = mock<RegisterFormData>();
  mockRegisterData.username = "foo-user";
  mockRegisterData.password = "foo-password";

  const confirmSignup = vi.fn();

  confirmSignup.mockRejectedValue(new Error("ANOTHER ERROR!"));

  const wrapper = mockDependencies({ register, confirmSignup });

  const { result } = renderHook(() => useRegisterBox(), { wrapper });

  await act(async () => result.current.onSubmit(mockRegisterData));
  await act(async () => result.current.onSubmit({ code: "no-code" }));

  expect(result.current.errorMessage).toEqual({ message: "ANOTHER ERROR!" });
});

test("If confirmMobile is successful, perform a login then redirects to homepage", async () => {
  const signupResult = mock<RegisterResponse>();
  signupResult.userConfirmed = false;
  const register = vi.fn();
  register.mockResolvedValue(signupResult);

  const login = vi.fn();
  const confirmSignup = vi.fn();

  register.mockResolvedValue(signupResult);
  login.mockReturnValue(Promise.resolve());

  const navigate = vi.fn();

  const wrapper = mockDependencies({
    register,
    login,
    confirmSignup,
    navigate,
  });

  const mockRegisterData = mock<RegisterFormData>();
  mockRegisterData.username = "foo-user";
  mockRegisterData.password = "foo-password";

  when(confirmSignup)
    .calledWith("foo-user", "bar-code")
    .mockResolvedValue("SUCCESS");

  const { result } = renderHook(() => useRegisterBox(), { wrapper });

  await act(async () => result.current.onSubmit(mockRegisterData));

  const mockConfirmData = { code: "bar-code" };

  await act(async () => result.current.onSubmit(mockConfirmData));

  expect(login).toBeCalledWith("foo-user", "foo-password");
  expect(navigate).toBeCalledWith("/account/");
});
