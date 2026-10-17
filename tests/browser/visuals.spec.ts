import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

test("3D planes render, rotate, reopen, and remain accessible", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await expect(page.locator(".plane-canvas canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Explore body planes" }).click();
  await expect(page.locator(".plane-explorer")).toHaveAttribute(
    "data-renderer",
    "ready",
    { timeout: 30000 },
  );
  await expect(
    page.getByRole("radio", { name: "Sagittal", exact: true }),
  ).toBeChecked();
  const canvas = page.locator(".plane-canvas canvas");
  const before = await canvas.screenshot();
  await page.getByRole("button", { name: "Rotate model right" }).click();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(before))
    .toBe(false);
  await page.getByRole("radio", { name: "Frontal", exact: true }).check();
  await expect(page.locator(".plane-description")).toContainText(
    "front (anterior) and back (posterior)",
  );
  await page.getByRole("radio", { name: "Transverse", exact: true }).check();
  await expect(page.locator(".plane-description")).toContainText(
    "upper and lower",
  );
  await page.getByRole("button", { name: "Reset view" }).click();
  fs.mkdirSync("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/visual-lab-" + testInfo.project.name + ".png",
  });
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(canvas).toHaveCount(0);
  await page.getByRole("button", { name: "Explore body planes" }).click();
  await expect(page.locator(".plane-explorer")).toHaveAttribute(
    "data-renderer",
    "ready",
  );
  await expect(
    page.getByRole("radio", { name: "Sagittal", exact: true }),
  ).toBeChecked();
  expect(errors).toEqual([]);
});

test("the visual lab still teaches the planes without WebGL", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Explore body planes" }).click();
  await expect(page.locator(".plane-explorer")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await expect(
    page.getByRole("button", { name: "Rotate model left" }),
  ).toBeDisabled();
  await page.getByRole("radio", { name: "Transverse", exact: true }).check();
  await expect(
    page.getByRole("img", { name: /Transverse plane:/ }),
  ).toBeVisible();
  await expect(page.locator(".plane-description")).toContainText(
    "upper and lower",
  );
  await expect(page.getByRole("status")).toContainText(
    "diagram and plane descriptions still work",
  );
});

test("motion respects input type, modal locks, navigation, and changed preferences", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  const html = page.locator("html");
  if (testInfo.project.name === "desktop") {
    await expect(html).toHaveClass(/lenis/);
    await page.locator(".journey-next").hover();
    await expect(page.locator(".journey-next .nprep-spotlight-glow")).toHaveCSS(
      "opacity",
      "1",
    );
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  } else {
    await expect(html).not.toHaveClass(/lenis/);
  }
  await page.getByRole("button", { name: "Explore body planes" }).click();
  if (testInfo.project.name === "desktop") {
    await expect(html).toHaveClass(/lenis-stopped/);
    const scroll = await page.evaluate(() => scrollY);
    await page.mouse.move(10, 100);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(scroll);
  }
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(html).not.toHaveClass(/lenis-stopped/);
  await page
    .getByRole("navigation")
    .filter({ visible: true })
    .getByRole("button", { name: "Practice", exact: true })
    .click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page
    .getByRole("navigation")
    .filter({ visible: true })
    .getByRole("button", { name: "My path", exact: true })
    .click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(html).not.toHaveClass(/lenis/);
  await expect(page.locator(".unit-banner")).toHaveCSS("transform", "none");
  await expect(page.locator(".journey-next .nprep-spotlight-glow")).toHaveCSS(
    "display",
    "none",
  );
  await page.getByRole("button", { name: /^LEARN:/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
