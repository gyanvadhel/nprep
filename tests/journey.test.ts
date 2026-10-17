import { describe, expect, it } from "vitest";
import { initialState, makeSession, stateSchema } from "../src/lib/learning";
import {
  advanceStage,
  answerStage,
  stageAvailable,
  startStage,
} from "../src/lib/journey";

describe("learning paths", () => {
  it("adds path defaults to existing saved progress without losing it", () => {
    const legacy = {
      ...initialState,
      name: "Asha",
      bookmarks: ["a1"],
      journey: undefined,
    };
    const migrated = stateSchema.parse(legacy);
    expect(migrated.journey).toEqual(initialState.journey);
    expect(migrated.name).toBe("Asha");
    expect(migrated.bookmarks).toEqual(["a1"]);
  });
  it("unlocks only after finishing a stage and never awards a completion twice", () => {
    let state = startStage(initialState, "anatomy:learn");
    expect(startStage(state, "anatomy:checkpoint")).toBe(state);
    expect(stageAvailable(state, "anatomy:match")).toBe(false);
    state = advanceStage(advanceStage(advanceStage(state)));
    expect(stageAvailable(state, "anatomy:match")).toBe(true);
    state = startStage(state, "anatomy:learn");
    state = advanceStage(advanceStage(advanceStage(state)));
    expect(state.journey.completed).toEqual(["anatomy:learn"]);
  });
  it("saves answers and schedules revision without replacing a practice session", () => {
    const practice = makeSession(["b1"], "Daily practice");
    let state = startStage(
      {
        ...initialState,
        session: practice,
        journey: {
          ...initialState.journey,
          completed: ["anatomy:learn", "anatomy:match"],
        },
      },
      "anatomy:practice",
    );
    expect(advanceStage(state)).toBe(state);
    state = answerStage(state, 0, "sure");
    expect(state.session).toEqual(practice);
    expect(state.reviews.a1).toBeDefined();
    expect(state.journey.run?.answers).toHaveLength(1);
    expect(answerStage(state, 1, "sure")).toBe(state);
    const restored = stateSchema.parse(JSON.parse(JSON.stringify(state)));
    expect(startStage(restored, "anatomy:practice")).toBe(restored);
    expect(advanceStage(restored).journey.run?.step).toBe(1);
  });
  it("requires 2 of 3 correct for a checkpoint and allows a fresh retry", () => {
    let state = startStage(
      {
        ...initialState,
        journey: {
          ...initialState.journey,
          completed: [
            "anatomy:learn",
            "anatomy:match",
            "anatomy:practice",
            "anatomy:apply",
          ],
        },
      },
      "anatomy:checkpoint",
    );
    for (const choice of [0, 0, 0])
      state = advanceStage(answerStage(state, choice, "sure"));
    expect(state.journey.run?.finished).toBe(true);
    expect(state.journey.completed).not.toContain("anatomy:checkpoint");
    state = startStage(state, "anatomy:checkpoint");
    for (const choice of [1, 2, 0])
      state = advanceStage(answerStage(state, choice, "sure"));
    expect(state.journey.completed).toContain("anatomy:checkpoint");
    expect(state.attempts).toHaveLength(6);
  });
});
