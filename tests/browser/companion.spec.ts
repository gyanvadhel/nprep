import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

test("practice survives reload and updates revision, bookmarks, and progress", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A little better, every day.",
  );
  fs.mkdirSync("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/dashboard-" + testInfo.project.name + ".png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Let’s practise" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Check answer" }),
  ).toBeDisabled();
  await dialog
    .getByRole("button", { name: "Save question", exact: true })
    .click();
  await dialog.getByRole("radio").nth(0).check();
  await dialog.getByRole("button", { name: "Feeling sure" }).click();
  await dialog.getByRole("button", { name: "Check answer" }).click();
  await expect(dialog.getByText("A good moment to learn.")).toBeVisible();
  await page.screenshot({
    path: "artifacts/question-" + testInfo.project.name + ".png",
    fullPage: true,
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue my session" }).click();
  await expect(page.getByText("A good moment to learn.")).toBeVisible();
  await page.getByRole("button", { name: "Next question" }).click();
  for (const [index, answer] of [2, 2, 0, 1, 2].entries()) {
    await page.getByRole("radio").nth(answer).check();
    await page.getByRole("button", { name: "Feeling sure" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();
    await expect(page.getByText("You've got it.")).toBeVisible();
    await page
      .getByRole("button", {
        name: index === 4 ? "See my results" : "Next question",
      })
      .click();
  }
  await expect(page.locator(".result-stats")).toContainText("83%");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("nprep.learning.v1")!),
  );
  expect(saved.attempts).toHaveLength(6);
  expect(saved.bookmarks).toEqual(["a1"]);
  expect(Object.keys(saved.reviews)).toEqual(["a1"]);
  await page.getByRole("button", { name: "Visit revision" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Good things take a second look.",
  );
  await expect(page.locator(".saved-row")).toHaveCount(1);
  await page.getByRole("tab", { name: /To revisit/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: /Saved questions/ }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".saved-row")).toHaveCount(1);
  await page.getByRole("button", { name: /Remove bookmark:/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "Keep the questions that make you think.",
    }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .filter({ visible: true })
    .getByRole("button", { name: /progress/i })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Small steps. Real progress.",
  );
  await expect(page.locator(".progress-overview")).toContainText("83%");
  await expect(page.locator(".activity-row")).toHaveCount(6);
  expect(errors).toEqual([]);
});
test("filters, profile preferences, and session replacement work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Personalise your learning" }).click();
  await page.getByLabel("Your first name").fill("Asha");
  await page.getByLabel("Your daily question goal").selectOption("3");
  await page.getByRole("button", { name: "Save my preferences" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A little progress, Asha.",
  );
  await page.getByRole("button", { name: "Let’s practise" }).click();
  await expect(page.getByText("Question 1 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("navigation")
    .filter({ visible: true })
    .getByRole("button", { name: "Practice", exact: true })
    .click();
  await page.getByRole("button", { name: "Blood", exact: true }).click();
  await expect(page.locator(".question-row")).toHaveCount(3);
  await page
    .getByRole("searchbox", { name: "Search questions" })
    .fill("plasma");
  await expect(page.locator(".question-row")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".question-row")).toHaveCount(9);
  await page.getByRole("searchbox").fill("liquid");
  await expect(page.locator(".question-row")).toHaveCount(1);
  await page.locator(".question-row").click();
  await expect(
    page.getByRole("heading", { name: "Start a fresh session?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start new session" }).click();
  await expect(
    page.getByRole("heading", {
      name: "What is the liquid component of blood called?",
    }),
  ).toBeVisible();
});
test("screens fit the viewport and pass automated accessibility checks", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  async function audit(name: string) {
    await expect(page.locator(".page-transition")).toHaveCSS("opacity", "1");
    if (name === "progress") await expect(page.locator(".chart")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    fs.mkdirSync("artifacts", { recursive: true });
    fs.writeFileSync(
      "artifacts/a11y-" + testInfo.project.name + "-" + name + ".json",
      JSON.stringify(result.violations, null, 2),
    );
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await audit("home");
  await page.getByRole("button", { name: "Let’s practise" }).click();
  await audit("quiz");
  await page.getByRole("button", { name: "Close dialog" }).click();
  for (const label of ["Practice", "Revision", "progress"]) {
    await page
      .getByRole("navigation")
      .filter({ visible: true })
      .getByRole("button", { name: new RegExp(label, "i") })
      .click();
    await audit(label);
  }
});
test("unavailable storage leaves practice usable and reports its limitation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage unavailable", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Let’s practise" }).click();
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("You've got it.")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Device storage" }),
  ).toContainText("Progress will last for this visit only");
});

test("daily dates follow the browser clock without hydration errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-12-01T18:29:50Z") });
  await page.goto("/");
  await expect(page.locator(".day-circle.today")).toHaveAttribute(
    "aria-label",
    "2026-12-01, today",
  );
  await page.clock.fastForward(70000);
  await expect(page.locator(".day-circle.today")).toHaveAttribute(
    "aria-label",
    "2026-12-02, today",
  );
  expect(errors).toEqual([]);
});
