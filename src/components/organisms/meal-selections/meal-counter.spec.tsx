import MealCounter from "./meal-counter";
import { QuantityStepper } from "../../molecules";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("The <MealCounter> component", () => {
  it("renders without errors", () => {
    render(<MealCounter title="foo" description="bar" />);
  });

  it("renders the title", () => {
    const wrapper = render(<MealCounter title="foo" description="bar" />);

    const foo = screen.getByText("foo");

    expect(foo).toBeInTheDocument();
  });

  it("Sets the title as the accessible name", () => {
    render(<MealCounter title="foo-title" description="bar" />);
    const counter = screen.getByRole("region");
    expect(counter).toHaveAccessibleName("foo-title");
  });

  it("renders the description", () => {
    render(<MealCounter title="foo" description="bar" />);

    const bar = screen.getByText("bar");
    expect(bar).toBeInTheDocument();
  });

  it("correctly configures the onChange handler", async () => {
    const onChange = vi.fn();
    render(
      <MealCounter
        title="foo"
        description="bar"
        min={2}
        max={4}
        value={3}
        onChange={onChange}
      />
    );

    const increaseButton = screen.getByRole("button", { name: "Increase" });

    await userEvent.click(increaseButton);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("correctly configures the min prop", async () => {
    const onChange = vi.fn();
    render(
      <MealCounter
        title="foo"
        description="bar"
        min={2}
        max={4}
        value={2}
        onChange={onChange}
      />
    );

    const decreaseButton = screen.getByRole("button", { name: "Decrease" });

    await userEvent.click(decreaseButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("correctly configures the max prop", async () => {
    const onChange = vi.fn();
    render(
      <MealCounter
        title="foo"
        description="bar"
        min={2}
        max={4}
        value={4}
        onChange={onChange}
      />
    );

    const increaseButton = screen.getByRole("button", { name: "Increase" });

    await userEvent.click(increaseButton);
    expect(onChange).not.toHaveBeenCalled();
  });
});
