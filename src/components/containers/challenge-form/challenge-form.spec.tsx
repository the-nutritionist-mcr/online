import { render, screen } from "@testing-library/react";
import { Input } from "../../atoms";
import ChallengeForm from "./challenge-form";
import { act } from "react-dom/test-utils";
import { ThemeProvider } from "@emotion/react";
import { mock } from "vitest-mock-extended";
import event from "@testing-library/user-event";

const theme = {
  colors: {
    buttonBlack: "black",
    labelText: "black",
  },
  menubarHeight: 100,
};

describe("the challenge form", () => {
  it("renders its children", () => {
    render(
      <ThemeProvider theme={theme}>
        <ChallengeForm>Hello!</ChallengeForm>
      </ThemeProvider>
    );

    expect(screen.queryByText("Hello!")).toBeInTheDocument();
  });

  it("renders a submit button with default text", () => {
    render(
      <ThemeProvider theme={theme}>
        <ChallengeForm>Hello!</ChallengeForm>
      </ThemeProvider>
    );

    const button = screen.queryByRole("button", { name: "Submit" });

    expect(button).toBeInTheDocument();
  });

  it("renders a submit button with text from prop", () => {
    render(
      <ThemeProvider theme={theme}>
        <ChallengeForm submitText="login">Hello!</ChallengeForm>
      </ThemeProvider>
    );

    const button = screen.queryByRole("button", { name: "login" });

    expect(button).toBeInTheDocument();
  });

  it("fires the submit handler when you press the button with all the data from the forms", async () => {
    const mockOnSubmit = vi.fn();

    render(
      <ThemeProvider theme={theme}>
        <ChallengeForm submitText="login" onSubmit={mockOnSubmit}>
          <input data-testid="one" name="foo" />
          <p>Some text in between</p>
          <input data-testid="two" name="bar" />
        </ChallengeForm>
      </ThemeProvider>
    );

    const fieldOne = screen.getByTestId("one");
    await event.type(fieldOne, "foo-value");

    const fieldTwo = screen.getByTestId("two");
    await event.type(fieldTwo, "bar-value");

    const button = screen.getByRole("button");
    await event.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      foo: "foo-value",
      bar: "bar-value",
    });
  });

  it("Can handle nested children", async () => {
    const mockOnSubmit = vi.fn();

    render(
      <ThemeProvider theme={theme}>
        <ChallengeForm submitText="login" onSubmit={mockOnSubmit}>
          <div>
            <input data-testid="one" name="foo" />
          </div>
          <input data-testid="two" name="bar" />
        </ChallengeForm>
      </ThemeProvider>
    );

    const fieldOne = screen.getByTestId("one");
    await event.type(fieldOne, "foo-value");

    const fieldTwo = screen.getByTestId("two");
    await event.type(fieldTwo, "bar-value");

    const button = screen.getByRole("button");
    await event.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      foo: "foo-value",
      bar: "bar-value",
    });
  });

  it("Displays error messages that have no fields", () => {
    interface FormData {
      foo: string;
      bar: string;
    }

    const mockOnSubmit = mock<(data: FormData) => void>();

    const errorMessages = [{ message: "An error" }];

    render(
      <ThemeProvider theme={theme}>
        <ChallengeForm
          submitText="login"
          onSubmit={mockOnSubmit}
          errors={errorMessages}
        >
          <Input name="foo" label="A label" />
          <Input name="bar" label="A label" />
        </ChallengeForm>
      </ThemeProvider>
    );

    expect(screen.queryByText("An error")).toBeInTheDocument();
  });

  it("Displays error messages that have no fields and removes weird period on end of error", () => {
    interface FormData {
      foo: string;
      bar: string;
    }

    const mockOnSubmit = mock<(data: FormData) => void>();

    const errorMessages = [{ message: "An error." }];

    render(
      <ThemeProvider theme={theme}>
        <ChallengeForm
          submitText="login"
          onSubmit={mockOnSubmit}
          errors={errorMessages}
        />
      </ThemeProvider>
    );

    expect(screen.queryByText("An error.")).not.toBeInTheDocument();
  });
});
