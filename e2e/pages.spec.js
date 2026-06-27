import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("should load without errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
    await expect(page.locator("h1")).toContainText("Uploop Vibe");
  });

  test("should have links to both showcases", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('a[href="/showcase/"]')).toBeVisible();
    await expect(page.locator('a[href="/vibe-ai/"]')).toBeVisible();
  });
});

test.describe("Component Showcase", () => {
  test("should load without JS errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("should render sidebar with categories", async ({ page }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("nav")).toContainText("Layout");
    await expect(page.locator("nav")).toContainText("Navigation");
    await expect(page.locator("nav")).toContainText("Data Entry");
  });

  test("should render first component demo", async ({ page }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Container");
    await expect(page.locator("main")).toBeVisible();
  });

  test("clicking sidebar switches component via shared state", async ({
    page,
  }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");
    // Shared state: click → appState.set → subscribe → loop.send → render
    await page.locator('nav button').filter({ hasText: 'Grid' }).first().click();
    await page.waitForTimeout(600);
    await expect(page.locator("h1")).toContainText("Grid");

    await page.locator('nav button').filter({ hasText: 'Breadcrumb' }).first().click();
    await page.waitForTimeout(600);
    await expect(page.locator("h1")).toContainText("Breadcrumb");

    await page.locator('nav button').filter({ hasText: 'Slider' }).first().click();
    await page.waitForTimeout(600);
    await expect(page.locator("h1")).toContainText("Slider");
  });

  test("should show code snippet", async ({ page }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("pre").first()).toBeVisible();
    await expect(page.locator("pre").first()).toContainText("import");
  });
});

test.describe("Vibe AI Examples", () => {
  test("should load without JS errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/vibe-ai/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("should render main heading", async ({ page }) => {
    await page.goto("/vibe-ai/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Vibe AI");
  });

  test("should have multiple section headings", async ({ page }) => {
    await page.goto("/vibe-ai/");
    await page.waitForLoadState("networkidle");
    const headings = page.locator("h2");
    await expect(headings.first()).toBeVisible();
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("should show component type selector", async ({ page }) => {
    await page.goto("/vibe-ai/");
    await page.waitForLoadState("networkidle");
    const select = page.locator("select").first();
    await expect(select).toBeVisible();
  });
});

test.describe("Navigation between pages", () => {
  test("can navigate from landing to showcase and back", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('a[href="/showcase/"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Container");
    await page.locator('a[href="/"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Uploop Vibe");
  });

  test("can navigate from landing to vibe-ai and back", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('a[href="/vibe-ai/"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Vibe AI");
    await page.locator('a[href="/"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Uploop Vibe");
  });
});
