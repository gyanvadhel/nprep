import {
  type LearningState,
  makeSession,
  recordAnswer,
  type Confidence,
} from "./learning";
import { questions, type Topic } from "./questions";

export type UnitId = "anatomy" | "blood" | "respiration";
export type StageKind = "learn" | "match" | "practice" | "apply" | "checkpoint";
export const stageKinds: StageKind[] = [
  "learn",
  "match",
  "practice",
  "apply",
  "checkpoint",
];
export const stageInfo = {
  learn: {
    label: "Meet the essentials",
    type: "LEARN",
    detail: "Three small ideas. A stronger foundation.",
    minutes: "2 min",
  },
  match: {
    label: "Make the connections",
    type: "MATCH",
    detail: "Pair each term with its meaning.",
    minutes: "1 min",
  },
  practice: {
    label: "Give it a go",
    type: "PRACTISE",
    detail: "Try two questions, with help along the way.",
    minutes: "2 min",
  },
  apply: {
    label: "One step further",
    type: "RECALL",
    detail: "Bring the last idea back from memory.",
    minutes: "1 min",
  },
  checkpoint: {
    label: "Your first milestone",
    type: "CHECKPOINT",
    detail: "Answer at least 2 of 3 correctly to finish the unit.",
    minutes: "3 min",
  },
};
export const units: {
  id: UnitId;
  topic: Topic;
  title: string;
  subtitle: string;
  pairs: [string, string][];
}[] = [
  {
    id: "anatomy",
    topic: "Anatomy",
    title: "A map of the human body",
    subtitle: "Start with position, planes, and direction.",
    pairs: [
      ["Anatomical position", "Palms facing forward"],
      ["Sagittal plane", "Right and left portions"],
      ["Proximal", "Nearer the limb’s attachment"],
    ],
  },
  {
    id: "blood",
    topic: "Blood",
    title: "Small cells. Big responsibilities.",
    subtitle: "Get to know the components of blood.",
    pairs: [
      ["Erythrocytes", "Transport oxygen"],
      ["Plasma", "Liquid component of blood"],
      ["Platelets", "Help with clotting"],
    ],
  },
  {
    id: "respiration",
    topic: "Respiration",
    title: "Follow every breath",
    subtitle: "Explore the airways and gas exchange.",
    pairs: [
      ["Alveoli", "Main site of gas exchange"],
      ["Trachea", "The windpipe"],
      ["Primary bronchi", "Two branches from the trachea"],
    ],
  },
];
export function getStage(id: string) {
  const unit = units.find((u) => id.startsWith(u.id + ":"));
  const kind = stageKinds.find((k) => id === unit?.id + ":" + k);
  return unit && kind ? { unit, kind, ...stageInfo[kind] } : null;
}
export function stageQuestions(id: string) {
  const stage = getStage(id);
  if (!stage) return [];
  const items = questions.filter((q) => q.topic === stage.unit.topic);
  if (stage.kind === "practice") return items.slice(0, 2);
  if (stage.kind === "apply") return items.slice(2);
  return items;
}
export function stageAvailable(state: LearningState, id: string) {
  const stage = getStage(id);
  if (!stage) return false;
  const index = stageKinds.indexOf(stage.kind);
  return (
    index === 0 ||
    state.journey.completed.includes(
      stage.unit.id + ":" + stageKinds[index - 1],
    )
  );
}
export function startStage(
  state: LearningState,
  stageId: string,
): LearningState {
  if (!stageAvailable(state, stageId)) return state;
  if (state.journey.run?.stageId === stageId && !state.journey.run.finished)
    return state;
  return {
    ...state,
    journey: {
      ...state.journey,
      run: {
        id: crypto.randomUUID(),
        stageId,
        step: 0,
        answers: [],
        finished: false,
      },
    },
  };
}
export function answerStage(
  state: LearningState,
  choice: number,
  confidence: Confidence,
): LearningState {
  const run = state.journey.run;
  if (!run || run.finished || run.answers[run.step]) return state;
  const stage = getStage(run.stageId);
  if (!stage || ["learn", "match"].includes(stage.kind)) return state;
  const question = stageQuestions(run.stageId)[run.step];
  if (!question) return state;
  const result = recordAnswer(
    {
      ...state,
      session: makeSession([question.id], stage.label, run.id + ":" + run.step),
    },
    choice,
    confidence,
  );
  const answer = result.session?.answers[0];
  if (!answer) return state;
  return {
    ...result,
    session: state.session,
    journey: {
      ...state.journey,
      run: { ...run, answers: [...run.answers, answer] },
    },
  };
}
export function advanceStage(state: LearningState): LearningState {
  const run = state.journey.run;
  if (!run || run.finished) return state;
  const stage = getStage(run.stageId);
  if (!stage) return state;
  if (!["learn", "match"].includes(stage.kind) && !run.answers[run.step])
    return state;
  const finished = run.step + 1 >= stageQuestions(run.stageId).length;
  const passed =
    stage.kind !== "checkpoint" ||
    run.answers.filter((a) => a.correct).length >= 2;
  return {
    ...state,
    journey: {
      ...state.journey,
      completed:
        finished && passed
          ? [...new Set([...state.journey.completed, run.stageId])]
          : state.journey.completed,
      run: { ...run, step: finished ? run.step : run.step + 1, finished },
    },
  };
}
