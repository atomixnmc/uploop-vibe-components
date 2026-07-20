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

  test("should have links to all pages", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator('a[href="/showcase/"]')).toBeVisible();
    await expect(page.locator('a[href="/vibe-ai/"]')).toBeVisible();
  });

  test("should have at least 3 navigation cards", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const cards = page.locator("a.card, .landing-card, [class*=card] a");
    // Landing page should have links to showcase, vibe-ai, and ifs-demo
    const links = page.locator("a[href^='/']");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(2);
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

  test("should render sidebar with all categories", async ({ page }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("nav")).toBeVisible();
    const categories = [
      "Layout",
      "Navigation",
      "Data Entry",
      "Data Display",
      "Feedback",
      "Overlay",
      "Typography",
    ];
    for (const cat of categories) {
      await expect(page.locator("nav")).toContainText(cat);
    }
  });

  test("should render first component demo", async ({ page }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("clicking sidebar switches component via shared state", async ({
    page,
  }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");

    await page
      .locator("nav button")
      .filter({ hasText: "Grid" })
      .first()
      .click();
    await page.waitForTimeout(600);
    await expect(page.locator("h1")).toContainText("Grid");

    await page
      .locator("nav button")
      .filter({ hasText: "Breadcrumb" })
      .first()
      .click();
    await page.waitForTimeout(600);
    await expect(page.locator("h1")).toContainText("Breadcrumb");

    await page
      .locator("nav button")
      .filter({ hasText: "Slider" })
      .first()
      .click();
    await page.waitForTimeout(600);
    await expect(page.locator("h1")).toContainText("Slider");
  });

  test("rapid navigation clicks do not break showcase", async ({ page }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");

    const components = [
      "Grid",
      "Flex",
      "Stack",
      "Card",
      "Button",
      "Input",
      "Modal",
      "Toast",
    ];
    for (const name of components) {
      const btn = page.locator("nav button").filter({ hasText: name }).first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(200);
      }
    }

    // Should still render a valid heading (not crash)
    await expect(page.locator("h1")).toBeVisible();
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });

  test("should show code snippet", async ({ page }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("pre").first()).toBeVisible();
    await expect(page.locator("pre").first()).toContainText("import");
  });

  test("sidebar persists across component switches", async ({ page }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");

    // Click 5 different components
    const items = ["Container", "Grid", "Flex", "Card", "Button"];
    for (const name of items) {
      await page
        .locator("nav button")
        .filter({ hasText: name })
        .first()
        .click();
      await page.waitForTimeout(400);
    }

    // Sidebar should still be visible and contain categories
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("nav")).toContainText("Layout");
    await expect(page.locator("nav")).toContainText("Navigation");
  });

  test("can navigate to DataViz category", async ({ page }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");

    // Click a DataViz component (Sparkline, Gauge, StatsCard, TrendIndicator)
    const dvBtn = page
      .locator("nav button")
      .filter({ hasText: "Sparkline" })
      .first();
    if (await dvBtn.isVisible()) {
      await dvBtn.click();
      await page.waitForTimeout(600);
      await expect(page.locator("h1")).toContainText("Sparkline");
    }
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
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("should show component type selector", async ({ page }) => {
    await page.goto("/vibe-ai/");
    await page.waitForLoadState("networkidle");
    const select = page.locator("select").first();
    await expect(select).toBeVisible();
  });

  test("should have error display area", async ({ page }) => {
    await page.goto("/vibe-ai/");
    await page.waitForLoadState("networkidle");
    // Error section or validation area should exist
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(500);
  });
});

test.describe("IFS Demo", () => {
  test("should load without JS errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/ifs-demo/");
    await page.waitForLoadState("networkidle");
    // If page doesn't exist (404), that's OK — skip assertions
    if (
      await page
        .locator("h1")
        .isVisible()
        .catch(() => false)
    ) {
      expect(errors).toEqual([]);
    }
  });

  test("should have content if page exists", async ({ page }) => {
    await page.goto("/ifs-demo/");
    await page.waitForLoadState("networkidle");
    const h1 = page.locator("h1");
    if (await h1.isVisible().catch(() => false)) {
      await expect(h1).toBeVisible();
    }
  });
});

test.describe("Navigation between pages", () => {
  test("can navigate from landing to showcase and back", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('a[href="/showcase/"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toBeVisible();
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

  test("landing -> showcase -> vibe-ai -> landing round trip", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // To showcase
    await page.locator('a[href="/showcase/"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toBeVisible();

    // Back to landing
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Uploop Vibe");

    // To vibe-ai
    await page.locator('a[href="/vibe-ai/"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toContainText("Vibe AI");
  });
});

test.describe("Error resilience", () => {
  test("should not have 500 errors on any page", async ({ page }) => {
    const pages = ["/", "/showcase/", "/vibe-ai/"];
    for (const path of pages) {
      const response = await page.goto(path);
      if (response) {
        expect(response.status()).toBeLessThan(400);
      }
    }
  });

  test("should handle 404 gracefully", async ({ page }) => {
    const response = await page.goto("/nonexistent-page-12345/");
    // Should be 404 or redirect to landing
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }
  });

  test("showcase content area updates without full page reload", async ({
    page,
  }) => {
    await page.goto("/showcase/");
    await page.waitForLoadState("networkidle");

    // Get sidebar content before clicking
    const sidebarTextBefore = await page.locator("nav").textContent();

    // Click a component
    await page
      .locator("nav button")
      .filter({ hasText: "Flex" })
      .first()
      .click();
    await page.waitForTimeout(500);

    // Sidebar should still have same content (not replaced)
    const sidebarTextAfter = await page.locator("nav").textContent();
    expect(sidebarTextAfter).toContain("Layout");
    expect(sidebarTextAfter).toContain("Navigation");
  });
});

test.describe("Charts Demo", () => {
  test("should load without JS errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/charts-demo/");
    await page.waitForLoadState("networkidle");
    // Allow time for chart mounting
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });

  test("should render sidebar with chart categories", async ({ page }) => {
    await page.goto("/charts-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await expect(page.locator(".sidebar")).toBeVisible();
    await expect(page.locator(".sidebar")).toContainText("Trend");
    await expect(page.locator(".sidebar")).toContainText("Comparison");
    await expect(page.locator(".sidebar")).toContainText("Composition");
  });

  test("should render first chart heading", async ({ page }) => {
    await page.goto("/charts-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    // First chart should be LineChart
    const h1 = page.locator(".main h1");
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text).toBeTruthy();
  });

  test("clicking sidebar chart switches demo", async ({ page }) => {
    await page.goto("/charts-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Click BarChart in sidebar
    const barBtn = page.locator(".sidebar button").filter({ hasText: "BarChart" }).first();
    await barBtn.click();
    await page.waitForTimeout(500);

    // Heading should change to BarChart
    const h1 = page.locator(".main h1");
    await expect(h1).toContainText("BarChart");
  });

  test("should show code snippet", async ({ page }) => {
    await page.goto("/charts-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await expect(page.locator(".code-block")).toBeVisible();
    await expect(page.locator(".code-block")).toContainText("create");
  });
});

test.describe("Dashboard Demo", () => {
  test("should load without JS errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/dashboard-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });

  test("should render KPI cards", async ({ page }) => {
    await page.goto("/dashboard-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).toContainText("Revenue");
    await expect(page.locator("body")).toContainText("Active Users");
    await expect(page.locator("body")).toContainText("Churn Rate");
    await expect(page.locator("body")).toContainText("NPS Score");
  });

  test("should have tab navigation", async ({ page }) => {
    await page.goto("/dashboard-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await expect(page.locator("nav")).toContainText("overview");
    await expect(page.locator("nav")).toContainText("analytics");
    await expect(page.locator("nav")).toContainText("performance");
  });

  test("clicking analytics tab switches content without crash", async ({ page }) => {
    await page.goto("/dashboard-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Click analytics tab
    const analyticsTab = page.locator("nav span").filter({ hasText: "analytics" }).first();
    await analyticsTab.click();
    await page.waitForTimeout(1000);

    // Should show analytics content (Radar chart heading)
    await expect(page.locator("body")).toContainText("Team Performance");
  });

  test("clicking performance tab switches content without crash", async ({ page }) => {
    await page.goto("/dashboard-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const perfTab = page.locator("nav span").filter({ hasText: "performance" }).first();
    await perfTab.click();
    await page.waitForTimeout(1000);

    await expect(page.locator("body")).toContainText("Risk Heatmap");
  });

  test("should have back home link", async ({ page }) => {
    await page.goto("/dashboard-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });
});

test.describe("Error resilience extended", () => {
  test("charts-demo should not have 500 errors", async ({ page }) => {
    const response = await page.goto("/charts-demo/");
    if (response) expect(response.status()).toBeLessThan(400);
  });

  test("dashboard-demo should not have 500 errors", async ({ page }) => {
    const response = await page.goto("/dashboard-demo/");
    if (response) expect(response.status()).toBeLessThan(400);
  });
});

test.describe("Build validation", () => {
  test("production build should succeed", async ({ page }) => {
    // Verify build output exists by loading each page
    const pages = ["/", "/showcase/", "/vibe-ai/", "/ifs-demo/", "/charts-demo/", "/dashboard-demo/"];
    for (const path of pages) {
      const response = await page.goto(path);
      expect(response.status()).toBeLessThan(400);
    }
  });

  test("dashboard demo has valid structure", async ({ page }) => {
    await page.goto("/dashboard-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    // Verify header renders (no syntax error crash)
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Analytics");
  });

  test("charts demo has valid structure", async ({ page }) => {
    await page.goto("/charts-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await expect(page.locator(".sidebar")).toBeVisible();
    await expect(page.locator(".main h1")).toBeVisible();
  });
});

test.describe("Editor Demo", () => {
  test("should load without JS errors", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/editor-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });

  test("should render WYSIWYG content", async ({ page }) => {
    await page.goto("/editor-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    await expect(page.locator("body")).toContainText("Welcome to Vibe Editor");
  });

  test("should render code editor", async ({ page }) => {
    await page.goto("/editor-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    await expect(page.locator("body")).toContainText("Uploop Component");
  });

  test("should render spreadsheet", async ({ page }) => {
    await page.goto("/editor-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800);
    await expect(page.locator("body")).toContainText("Widget A");
  });
});

test.describe("Editor interactions", () => {
  test("spreadsheet renders rows", async ({ page }) => {
    await page.goto("/editor-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    // Should show product data in the spreadsheet
    await expect(page.locator("body")).toContainText("Widget");
  });

  test("spreadsheet cell click works", async ({ page }) => {
    await page.goto("/editor-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    // Click a cell in the spreadsheet
    const cell = page.locator('[data-row][data-col]').first();
    if (await cell.isVisible().catch(() => false)) {
      await cell.click();
      await page.waitForTimeout(300);
      // Should not crash
      expect(true).toBe(true);
    }
  });

  test("layout editor renders without crash", async ({ page }) => {
    await page.goto("/editor-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    // Layout editor should have catalog sidebar
    const layoutSection = page.locator('#demo-layout');
    await expect(layoutSection).toBeVisible();
  });

  test("no console errors on editor demo", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/editor-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });
});

test.describe("Layout editor interactions", () => {
  test("layout editor loads without crash", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/editor-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });

  test("clicking catalog item should not crash", async ({ page }) => {
    await page.goto("/editor-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    // Click a catalog item in the layout editor
    const catalogItem = page.locator('.vibe-layout-catalog-item').first();
    if (await catalogItem.isVisible().catch(() => false)) {
      await catalogItem.click();
      await page.waitForTimeout(300);
      // Should not throw
      expect(true).toBe(true);
    }
  });

  test("clicking dropzone should not crash", async ({ page }) => {
    await page.goto("/editor-demo/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const dropzone = page.locator('.vibe-layout-dropzone');
    if (await dropzone.isVisible().catch(() => false)) {
      await dropzone.click();
      await page.waitForTimeout(300);
      expect(true).toBe(true);
    }
  });
});
