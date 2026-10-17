import { z } from "zod";
import { questionById } from "./questions";

const confidenceSchema = z.enum(["sure", "unsure"]);
export type Confidence = z.infer<typeof confidenceSchema>;
export const attemptSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  choice: z.number().int().min(0).max(3),
  confidence: confidenceSchema,
  correct: z.boolean(),
  at: z.iso.datetime(),
});
export type Attempt = z.infer<typeof attemptSchema>;
const sessionSchema = z.object({
  id: z.string(),
  questionIds: z.array(z.string()).min(1),
  index: z.number().int().min(0),
  answers: z.array(attemptSchema),
  complete: z.boolean(),
  label: z.string(),
});
export type Session = z.infer<typeof sessionSchema>;
export const stateSchema = z.object({
  version: z.literal(1),
  name: z.string().max(40),
  dailyGoal: z.number().int().min(3).max(30),
  attempts: z.array(attemptSchema),
  bookmarks: z.array(z.string()),
  reviews: z.record(
    z.string(),
    z.object({
      dueAt: z.iso.datetime(),
      stage: z.number().int().min(0).max(2),
    }),
  ),
  session: sessionSchema.nullable(),
  journey: z
    .object({
      unit: z.enum(["anatomy", "blood", "respiration"]).default("anatomy"),
      completed: z.array(z.string()).default([]),
      run: z
        .object({
          id: z.string(),
          stageId: z.string(),
          step: z.number().int().min(0),
          answers: z.array(attemptSchema),
          finished: z.boolean(),
        })
        .nullable()
        .default(null),
    })
    .default({ unit: "anatomy", completed: [], run: null }),
});
export type LearningState = z.infer<typeof stateSchema>;
export const initialState: LearningState = {
  version: 1,
  name: "",
  dailyGoal: 6,
  attempts: [],
  bookmarks: [],
  reviews: {},
  session: null,
  journey: { unit: "anatomy", completed: [], run: null },
};
export function dayKey(date: Date | string = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
export function daysThisWeek(now = new Date()) {
  const today = new Date(dayKey(now) + "T12:00:00Z");
  const offset = (today.getUTCDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - offset + i);
    return {
      key: d.toISOString().slice(0, 10),
      label: ["M", "T", "W", "T", "F", "S", "S"][i],
      date: d.getUTCDate(),
    };
  });
}
export function streak(attempts: Attempt[], now = new Date()) {
  const dates = new Set(attempts.map((a) => dayKey(a.at)));
  const cursor = new Date(dayKey(now) + "T12:00:00Z");
  if (!dates.has(cursor.toISOString().slice(0, 10)))
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  let count = 0;
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    count++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return count;
}
export function makeSession(
  ids: string[],
  label: string,
  id = crypto.randomUUID(),
): Session {
  const validIds = [...new Set(ids)].filter((qid) => questionById(qid));
  if (!validIds.length)
    throw new Error("A session needs at least one available question.");
  return {
    id,
    questionIds: validIds,
    index: 0,
    answers: [],
    complete: false,
    label,
  };
}
export function recordAnswer(
  state: LearningState,
  choice: number,
  confidence: Confidence,
  now = new Date(),
): LearningState {
  const session = state.session;
  if (!session || session.complete) return state;
  const q = questionById(session.questionIds[session.index]);
  if (
    !q ||
    choice < 0 ||
    choice >= q.options.length ||
    !Number.isInteger(choice)
  )
    return state;
  const id = session.id + ":" + q.id;
  if (state.attempts.some((a) => a.id === id)) return state;
  const correct = choice === q.answer;
  const answer: Attempt = {
    id,
    questionId: q.id,
    choice,
    confidence,
    correct,
    at: now.toISOString(),
  };
  const reviews = { ...state.reviews };
  if (!correct || confidence === "unsure") {
    reviews[q.id] = {
      dueAt: new Date(now.getTime() + 86400000).toISOString(),
      stage: 0,
    };
  } else if (reviews[q.id]) {
    const stage = reviews[q.id].stage + 1;
    if (stage >= 3) delete reviews[q.id];
    else
      reviews[q.id] = {
        stage,
        dueAt: new Date(
          now.getTime() + [1, 3, 7][stage] * 86400000,
        ).toISOString(),
      };
  }
  return {
    ...state,
    attempts: [...state.attempts, answer],
    reviews,
    session: { ...session, answers: [...session.answers, answer] },
  };
}
export function nextQuestion(state: LearningState): LearningState {
  const s = state.session;
  if (
    !s ||
    s.complete ||
    !s.answers.some((a) => a.questionId === s.questionIds[s.index])
  )
    return state;
  return {
    ...state,
    session:
      s.index + 1 >= s.questionIds.length
        ? { ...s, complete: true }
        : { ...s, index: s.index + 1 },
  };
}
export function accuracy(attempts: Attempt[]) {
  return attempts.length
    ? Math.round(
        (attempts.filter((a) => a.correct).length / attempts.length) * 100,
      )
    : 0;
}
