import { describe, expect, it } from "vitest";
import {
  initialState,
  makeSession,
  recordAnswer,
  nextQuestion,
  streak,
  dayKey,
  accuracy,
  stateSchema,
  type LearningState,
} from "../src/lib/learning";
const now = new Date("2026-10-17T10:00:00Z");
function fresh(ids = ["a1", "a2"]): LearningState {
  return { ...initialState, session: makeSession(ids, "Test", "session-1") };
}
describe("learning history and revision", () => {
  it("scores an answer once, even when a submission is retried", () => {
    const state = recordAnswer(fresh(), 1, "sure", now);
    const duplicate = recordAnswer(state, 0, "unsure", now);
    expect(duplicate.attempts).toHaveLength(1);
    expect(accuracy(duplicate.attempts)).toBe(100);
    expect(duplicate.reviews).toEqual({});
  });
  it("schedules mistakes and uncertain correct answers for the next day", () => {
    for (const [choice, confidence] of [
      [0, "sure"],
      [1, "unsure"],
    ] as const) {
      const state = recordAnswer(fresh(), choice, confidence, now);
      expect(state.reviews.a1).toEqual({
        stage: 0,
        dueAt: "2026-10-18T10:00:00.000Z",
      });
    }
  });
  it("does not skip unanswered questions and completes only after the final answer", () => {
    let state = fresh();
    expect(nextQuestion(state)).toBe(state);
    state = nextQuestion(recordAnswer(state, 1, "sure", now));
    expect(state.session?.index).toBe(1);
    expect(state.session?.complete).toBe(false);
    state = nextQuestion(recordAnswer(state, 2, "sure", now));
    expect(state.session?.complete).toBe(true);
    expect(recordAnswer(state, 0, "unsure", now)).toBe(state);
  });
  it("spaces successful reviews at 3 and 7 days, then clears the queue", () => {
    let state = recordAnswer(fresh(["a1"]), 0, "sure", now);
    for (let i = 1; i <= 3; i++) {
      state = {
        ...state,
        session: makeSession(["a1"], "Review", "review-" + i),
      };
      state = recordAnswer(state, 1, "sure", now);
      if (i < 3)
        expect(state.reviews.a1.dueAt).toBe(
          new Date(now.getTime() + (i === 1 ? 3 : 7) * 86400000).toISOString(),
        );
    }
    expect(state.reviews.a1).toBeUndefined();
  });
  it("resets the revision interval after a new mistake", () => {
    const state = {
      ...fresh(["a1"]),
      reviews: { a1: { stage: 2, dueAt: now.toISOString() } },
    };
    expect(recordAnswer(state, 0, "sure", now).reviews.a1.stage).toBe(0);
  });
  it("uses India dates and keeps yesterday's streak until today is missed", () => {
    expect(dayKey("2026-10-17T20:00:00Z")).toBe("2026-10-18");
    const a = recordAnswer(fresh(), 1, "sure", new Date("2026-10-16T20:00:00Z"))
      .attempts[0];
    expect(streak([a], new Date("2026-10-18T08:00:00Z"))).toBe(1);
    expect(streak([a], new Date("2026-10-19T08:00:00Z"))).toBe(0);
  });
  it("validates saved data and excludes duplicate or unavailable questions", () => {
    expect(stateSchema.safeParse({ version: 5 }).success).toBe(false);
    expect(makeSession(["a1", "a1", "missing"], "Test").questionIds).toEqual([
      "a1",
    ]);
    expect(() => makeSession(["missing"], "Test")).toThrow();
    expect(recordAnswer(fresh(), 99, "sure", now).attempts).toHaveLength(0);
  });
});
