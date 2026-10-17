import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

async function checkQuestion(page: Page, choice: number, last = false) {
  await page
    .getByRole("group", { name: "Choose your answer" })
    .getByRole("radio")
    .nth(choice)
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", {
      name: last ? "Finish stage" : "Next question",
      exact: true,
    })
    .click();
}

test("complete a path, resume checked answers, retry a checkpoint, and replay without duplicate rewards", async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Your next chapter starts here.",
  );
  await expect(page.getByRole("button", { name: /^MATCH:/ })).toBeDisabled();
  fs.mkdirSync("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/path-" + testInfo.project.name + ".png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Let’s learn" }).click();
  await expect(page.getByRole("button", { name: "Next idea" })).toBeDisabled();
  for (let i = 0; i < 3; i++) {
    await page.locator(".learning-card").click();
    if (i === 0)
      await page.screenshot({
        path: "artifacts/lesson-" + testInfo.project.name + ".png",
        fullPage: true,
      });
    await page
      .getByRole("button", {
        name: i === 2 ? "Finish learning" : "Next idea",
        exact: true,
      })
      .click();
  }
  await expect(page.getByText("That’s a little win.")).toBeVisible();
  await page.getByRole("button", { name: "Next stage" }).click();
  await page.getByRole("radio", { name: "Right and left portions" }).check();
  await page.getByRole("button", { name: "Check match" }).click();
  await expect(page.getByText("Not quite. Try another pairing.")).toBeVisible();
  for (const [i, meaning] of [
    "Palms facing forward",
    "Right and left portions",
    "Nearer the limb’s attachment",
  ].entries()) {
    await page.getByRole("radio", { name: meaning }).check();
    await page.getByRole("button", { name: "Check match" }).click();
    await page
      .getByRole("button", { name: i === 2 ? "Finish matching" : "Next pair" })
      .click();
  }
  await page.getByRole("button", { name: "Next stage" }).click();
  await page
    .getByRole("group", { name: "Choose your answer" })
    .getByRole("radio")
    .first()
    .check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Continue stage", exact: true })
    .click();
  await expect(page.getByText("A good moment to learn.")).toBeVisible();
  await page
    .getByRole("button", { name: "Next question", exact: true })
    .click();
  await checkQuestion(page, 2, true);
  await page.getByRole("button", { name: "Next stage" }).click();
  await checkQuestion(page, 2, true);
  await page.getByRole("button", { name: "Next stage" }).click();
  for (let i = 0; i < 3; i++) await checkQuestion(page, 0, i === 2);
  await expect(page.getByText("Let’s give that another go.")).toBeVisible();
  await page.getByRole("button", { name: "Try checkpoint again" }).click();
  for (const [i, choice] of [1, 2, 2].entries())
    await checkQuestion(page, choice, i === 2);
  await expect(page.getByText("Your unit badge is here!")).toBeVisible();
  await page.getByRole("button", { name: "Back to my path" }).click();
  await expect(page.locator(".journey-points")).toContainText("100");
  await expect(
    page.getByRole("progressbar", { name: "Anatomy stages completed" }),
  ).toHaveAttribute("value", "5");
  await page.getByRole("button", { name: "Replay checkpoint" }).click();
  for (const [i, choice] of [1, 2, 2].entries())
    await checkQuestion(page, choice, i === 2);
  await page.getByRole("button", { name: "Back to my path" }).click();
  await page.reload();
  await expect(page.locator(".journey-points")).toContainText("100");
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("nprep.learning.v1")!),
  );
  expect(saved.journey.completed).toHaveLength(5);
  expect(saved.attempts).toHaveLength(12);
  expect(errors).toEqual([]);
});

test("units, lesson replacement, storage fallback, and accessibility", async ({
  page,
}, testInfo) => {
  await page.goto("./");
  async function audit(name: string) {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    fs.mkdirSync("artifacts", { recursive: true });
    fs.writeFileSync(
      "artifacts/a11y-path-" + testInfo.project.name + "-" + name + ".json",
      JSON.stringify(result.violations, null, 2),
    );
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await audit("map");
  await page.getByRole("button", { name: "Let’s learn" }).click();
  await audit("card");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "02 Blood", exact: true }).click();
  await page.getByRole("button", { name: "Let’s learn" }).click();
  await expect(
    page.getByRole("heading", { name: "Pick up or start fresh?" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start this stage", exact: true })
    .click();
  await expect(page.locator(".learning-card")).toContainText(
    "transporting oxygen",
  );
  for (let i = 0; i < 3; i++) {
    await page.locator(".learning-card").click();
    await page
      .getByRole("button", {
        name: i === 2 ? "Finish learning" : "Next idea",
        exact: true,
      })
      .click();
  }
  await page.getByRole("button", { name: "Next stage" }).click();
  await audit("matching");
  for (const [i, meaning] of [
    "Transport oxygen",
    "Liquid component of blood",
    "Help with clotting",
  ].entries()) {
    await page.getByRole("radio", { name: meaning }).check();
    await page.getByRole("button", { name: "Check match" }).click();
    await page
      .getByRole("button", { name: i === 2 ? "Finish matching" : "Next pair" })
      .click();
  }
  await audit("completion");
  await page.getByRole("button", { name: "Next stage" }).click();
  await audit("question");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("button", { name: "03 Respiration", exact: true })
    .click();
  await page.getByRole("button", { name: "Let’s learn" }).click();
  await page
    .getByRole("button", { name: "Start this stage", exact: true })
    .click();
  await expect(page.locator(".learning-card")).toContainText("gas exchange");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
  });
  await page.locator(".learning-card").click();
  await page.getByRole("button", { name: "Next idea" }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Device storage" }),
  ).toContainText("Progress will last for this visit only");
});
