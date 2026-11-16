import { expect, test, type Page } from "@playwright/test";

/** Fails the test on any console error or uncaught exception (incl. CSP violations). */
function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", e => errors.push(e.message));
  return errors;
}

const slip = (page: Page) => page.getByRole("region", { name: "Bet slip" });

test.describe("homepage", () => {
  test("renders as drawn: banner, tiles, five live cricket leagues", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Live Casino" })).toBeVisible();
    for (const t of ["Mybet Games", "Crash", "Crystal", "Burning Hot", "Midgards Zombies", "Wester Slot", "Solitaire"]) {
      await expect(page.locator("main").getByRole("link", { name: t, exact: true }).first()).toBeVisible();
    }
    const leagues = page.locator("main section[aria-label]").filter({ has: page.locator("a[href^='/line/cricket/']") });
    await expect(leagues).toHaveCount(5);
    await expect(page.getByRole("button", { name: /Yas Lions – Emirates Eagles: 1X2 1 at 1.936/ }).first()).toBeVisible();
    await expect(page.getByText("ALL 998")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("search and tabs are driven by the URL", async ({ page }) => {
    await page.goto("/?q=tuskers");
    const main = page.locator("main");
    await expect(main.getByText("Matabeleland Tuskers")).toBeVisible();
    await expect(main.getByText("Gamdevi CC")).toHaveCount(0);
    await page.goto("/?q=zzzz");
    await expect(main.getByText(/No matches found for/)).toBeVisible();
    await page.goto("/");
    await page.getByRole("link", { name: "Recommended", exact: true }).first().click();
    await expect(page).toHaveURL(/tab=recommended/);
    await expect(main.getByText("Arsenal")).toBeVisible();
  });
});

test.describe("bet slip", () => {
  test("single, accumulator and same-match replacement", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Yas Lions – Emirates Eagles: 1X2 1 at 1.936/ }).first().click();
    await expect(slip(page).getByText("LKR 193.6")).toBeVisible();

    await page.getByRole("button", { name: /Matabeleland Tuskers – Mid West Rhinos: 1X2 2 at 1.896/ }).click();
    await expect(slip(page).getByRole("radio", { name: "Accumulator" })).toHaveAttribute("aria-checked", "true");
    await expect(slip(page).getByText("3.671")).toBeVisible();
    await expect(slip(page).getByText("LKR 367.1")).toBeVisible();

    // Another outcome from the same match replaces the first pick.
    await page.getByRole("button", { name: /Yas Lions – Emirates Eagles: 1X2 2 at 1.896/ }).first().click();
    await expect(slip(page).getByRole("listitem")).toHaveCount(2);
    await expect(slip(page).getByText("3.595")).toBeVisible(); // 1.896 × 1.896
  });

  test("persists across reloads and loads from a code", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.getByRole("button", { name: /Gamdevi CC – Aghadi: 1X2 X at 30/ }).click();
    await page.reload();
    await expect(slip(page).getByText("Gamdevi CC – Aghadi")).toBeVisible();

    const saveLoad = page.getByRole("region", { name: "Save or load bet slip" });
    await saveLoad.getByRole("button", { name: "Save", exact: true }).last().click();
    const code = await saveLoad.getByLabel("Bet slip code").inputValue();
    expect(code).toMatch(/^MB1\./);

    await slip(page).getByRole("button", { name: "Clear bet slip" }).click();
    await expect(slip(page).getByText(/Add events to the bet slip/)).toBeVisible();
    await saveLoad.getByRole("tab", { name: "Load" }).click();
    await saveLoad.getByLabel("Load bet slip").fill("MB1.not-a-real-code");
    await saveLoad.getByRole("button", { name: "Load", exact: true }).last().click();
    await expect(saveLoad.getByText("This code is not valid.")).toBeVisible();
    await saveLoad.getByLabel("Load bet slip").fill(code);
    await saveLoad.getByRole("button", { name: "Load", exact: true }).last().click();
    await expect(slip(page).getByText("Gamdevi CC – Aghadi")).toBeVisible();
  });
});

test.describe("auth dialogs (demo mode)", () => {
  test("login validates, then lets the user place a bet", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("button", { name: "Login" }).click();
    const dialog = page.getByRole("dialog", { name: "Login" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Log in" }).click();
    await expect(dialog.getByText("Enter your phone number or e-mail")).toBeVisible();

    await dialog.getByPlaceholder("Phone number or e-mail").fill("0712345678");
    await dialog.getByPlaceholder("Password").fill("secret-pass");
    await dialog.getByRole("button", { name: "Log in" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("banner").getByText("Player 5678")).toBeVisible();

    await page.getByRole("button", { name: /Yas Lions – Emirates Eagles: 1X2 1 at 1.936/ }).first().click();
    await slip(page).getByRole("button", { name: "Place bet" }).click();
    await expect(slip(page).getByText(/Bet accepted: D-/)).toBeVisible();
    await slip(page).getByRole("tab", { name: "My Bet" }).click();
    await expect(slip(page).getByText("Yas Lions – Emirates Eagles")).toBeVisible();
  });

  test("registration by phone with the demo code", async ({ page }) => {
    await page.goto("/");
    const card = page.locator("aside").getByRole("form").or(page.locator("aside form")).first();
    await card.getByLabel("Mobile number").fill("12345");
    await card.getByRole("button", { name: "Send via SMS" }).click();
    await expect(card.getByText(/valid mobile number/)).toBeVisible();
    await card.getByLabel("Mobile number").fill("71 234 5678");
    await card.getByRole("button", { name: "Send via SMS" }).click();
    await expect(card.getByText(/Use code 123456/)).toBeVisible();
    await expect(card.getByRole("button", { name: /Resend in/ })).toBeDisabled();
    await card.getByLabel("Confirmation code").fill("123456");
    await card.getByRole("button", { name: "Register" }).click();
    await expect(page.getByText("Welcome,")).toBeVisible();
  });

  test("Esc closes the dialog", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("button", { name: "Registration" }).click();
    await expect(page.getByRole("dialog", { name: "Registration" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

test.describe("sitemap pages", () => {
  test("sports → sport → league → match", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "SPORTS" }).click();
    await expect(page).toHaveURL("/line");
    await page.goto("/line/football");
    await expect(page.getByRole("heading", { name: "Football" })).toBeVisible();
    await page.getByRole("link", { name: /England\. Premier League/ }).first().click();
    await expect(page.getByRole("heading", { name: "England. Premier League" })).toBeVisible();
    await page.getByRole("link", { name: /Arsenal/ }).first().click();
    await expect(page).toHaveURL("/line/football/england-premier-league/arsenal-chelsea");
    await expect(page.getByRole("region", { name: "Correct score" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Football" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("every template responds", async ({ request }) => {
    for (const path of [
      "/live", "/cyber/esports", "/allgamesentrance", "/allgamesentrance/crash", "/casino", "/casino?tab=live&provider=atlas-live",
      "/casino/brand?game=burning-hot&product=lumen-gaming", "/bonus", "/bonus?tab=casino", "/bonus/rules/first-deposit-bonus",
      "/bonus/casino/tournaments/weekly-slots-race", "/information/about", "/information/contacts",
    ]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
    }
  });

  // Params unknown at build time stream from the static shell, so Next.js keeps
  // status 200 and adds <meta name="robots" content="noindex"> (documented behaviour).
  test("unknown and mismatched URLs show the not-found page", async ({ page }) => {
    for (const path of ["/line/curling", "/line/cricket/england-premier-league", "/line/football/spain-la-liga/arsenal-chelsea", "/allgamesentrance/burning-hot"]) {
      const res = await page.goto(path);
      expect([200, 404], path).toContain(res?.status());
      await expect(page.getByRole("heading", { name: "This page is not available" }), path).toBeVisible();
      await expect(page.locator('meta[name="robots"][content*="noindex"]').first(), path).toBeAttached();
    }
    await page.goto("/casino/brand?game=nope");
    await expect(page.getByRole("heading", { name: "This page is not available" })).toBeVisible();
  });

  test("casino lobby filters by tab and provider", async ({ page }) => {
    await page.goto("/casino?tab=live");
    await expect(page.locator("main").getByRole("link", { name: "Live Roulette" })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Burning Hot" })).toHaveCount(0);
    await page.goto("/casino?provider=tiger-spin");
    await expect(page.locator("main").getByRole("link", { name: "Tiger Fortune" })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: "Golden Pharaoh" })).toHaveCount(0);
  });

  test("sitemap.xml and robots.txt", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/line/football/england-premier-league/arsenal-chelsea");
    expect(xml).toContain("/casino/brand?game=burning-hot&amp;product=lumen-gaming");
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /api/");
  });
});

test.describe("API security", () => {
  test("security headers and CSRF check", async ({ request, baseURL }) => {
    const res = await request.get("/");
    expect(res.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["x-powered-by"]).toBeUndefined();
    const forged = await request.post("/api/bets", { data: {}, headers: { origin: "https://evil.example" } });
    expect(forged.status()).toBe(403);
    const invalid = await request.post("/api/bets", { data: { mode: "single" }, headers: { origin: baseURL! } });
    expect(invalid.status()).toBe(422);
  });
});

test.describe("mobile @mobile", () => {
  test("menu drawer and bet slip drawer", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    const errors = watchConsole(page);
    await page.goto("/");
    await expect(page.getByRole("complementary", { name: "Sections" })).not.toBeInViewport();
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("complementary", { name: "Sections" })).toBeInViewport();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("complementary", { name: "Sections" })).not.toBeInViewport();

    await page.getByRole("button", { name: /Yas Lions – Emirates Eagles: 1X2 1 at 1.936/ }).first().click();
    await page.getByRole("button", { name: /^Bet slip/ }).click();
    await expect(slip(page).getByText("LKR 193.6")).toBeInViewport();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
});
