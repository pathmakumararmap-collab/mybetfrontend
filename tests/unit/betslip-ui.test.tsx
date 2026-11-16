// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { OddsButton } from "@/components/betslip/OddsButton";
import { BetSlipCard } from "@/components/betslip/BetSlip";
import { slipStore, sessionStore } from "@/lib/client/stores";
import { EMPTY_SLIP, type Selection } from "@/lib/betslip";

const selection: Selection = {
  matchId: "m1", matchLabel: "Yas Lions – Emirates Eagles", href: "/line/cricket/abu-dhabi-t10-league/m1",
  marketId: "m1:1x2", marketName: "1X2", outcomeId: "m1:1x2:1", outcomeLabel: "1", odds: 1.936, live: true,
};

beforeEach(() => {
  act(() => {
    slipStore.set(EMPTY_SLIP);
    sessionStore.set({ status: "guest", user: null, demo: true });
  });
});
afterEach(cleanup);

describe("bet slip UI", () => {
  it("toggles a selection and shows the potential win", async () => {
    const user = userEvent.setup();
    render(<><OddsButton selection={selection} /><BetSlipCard /></>);
    const odds = screen.getByRole("button", { name: /Yas Lions – Emirates Eagles: 1X2 1 at 1.936/ });
    expect(odds).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/Add events to the bet slip/)).toBeInTheDocument();

    await user.click(odds);
    expect(odds).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("LKR 193.6")).toBeInTheDocument(); // 100 × 1.936
    expect(screen.getByText("Log in to place your bet")).toBeInTheDocument();

    await user.click(odds);
    expect(odds).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/Add events to the bet slip/)).toBeInTheDocument();
  });

  it("updates the potential win when the stake changes", async () => {
    const user = userEvent.setup();
    render(<><OddsButton selection={selection} /><BetSlipCard /></>);
    await user.click(screen.getByRole("button", { name: /at 1.936/ }));
    const stake = screen.getByLabelText(/Stake/);
    await user.clear(stake);
    await user.type(stake, "250");
    expect(screen.getByText("LKR 484")).toBeInTheDocument(); // 250 × 1.936
  });
});
