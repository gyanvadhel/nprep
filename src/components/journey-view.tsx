"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Flag,
  Leaf,
  LockKeyhole,
  Puzzle,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { useLearning } from "@/lib/store";
import {
  advanceStage,
  answerStage,
  getStage,
  stageAvailable,
  stageInfo,
  stageKinds,
  stageQuestions,
  startStage,
  units,
  type StageKind,
} from "@/lib/journey";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";

const icons = {
  learn: BookOpen,
  match: Puzzle,
  practice: Target,
  apply: Sparkles,
  checkpoint: Flag,
};

function StudyNotes() {
  return (
    <svg
      className="chapter-art"
      viewBox="0 0 250 180"
      fill="none"
      aria-hidden="true"
    >
      <path d="M22 153H230" stroke="#d6d6c7" />
      <g transform="rotate(-9 125 90)">
        <rect x="63" y="25" width="139" height="132" rx="5" fill="#d3dfca" />
        <path d="M80 25V157" stroke="#afc19f" />
      </g>
      <g transform="rotate(6 125 90)">
        <rect
          x="45"
          y="20"
          width="139"
          height="132"
          rx="5"
          fill="#fffdf6"
          stroke="#d7d8c9"
        />
        <path d="M66 20V152" stroke="#e8d5c4" />
        <path d="M78 44H157M78 55H131" stroke="#c3cbb6" strokeWidth="3" />
        <rect x="78" y="75" width="33" height="33" rx="3" fill="#e9eee0" />
        <path d="M88 91L94 97L104 84" stroke="#59734d" strokeWidth="2.5" />
        <path
          d="M123 82H158M123 93H149M78 124H158M78 134H136"
          stroke="#c3cbb6"
          strokeWidth="3"
        />
        <path d="M150 20H165V38L157.5 33L150 38V20Z" fill="#b37759" />
      </g>
      <path d="M199 64L213 67L190 143L176 139L199 64Z" fill="#315642" />
      <path d="M176 139L180 153L190 143" fill="#c99570" />
      <path d="M180 153L179 147L184 149Z" fill="#315642" />
    </svg>
  );
}

export function JourneyView({
  goRevision,
  goPractice,
}: {
  goRevision: () => void;
  goPractice: () => void;
}) {
  const { state, update } = useLearning();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const unit = units.find((u) => u.id === state.journey.unit) ?? units[0];
  const completed = stageKinds.filter((k) =>
    state.journey.completed.includes(unit.id + ":" + k),
  ).length;
  const total = units
    .flatMap((u) => stageKinds.map((k) => u.id + ":" + k))
    .filter((id) => state.journey.completed.includes(id)).length;
  const nextKind = stageKinds.find(
    (k) => !state.journey.completed.includes(unit.id + ":" + k),
  );
  const nextId = unit.id + ":" + (nextKind ?? "checkpoint");
  const activeRun = state.journey.run;
  function begin(id: string) {
    update((s) => startStage(s, id));
    setOpen(true);
  }
  function start(id: string) {
    if (activeRun && !activeRun.finished && activeRun.stageId !== id)
      setPending(id);
    else begin(id);
  }
  return (
    <>
      <div className="journey-heading">
        <div>
          <p className="journey-eyebrow">
            <Leaf size={14} /> ONE SMALL STEP, EVERY DAY
          </p>
          <h1>Your next chapter starts here.</h1>
          <p>A little curiosity. A few minutes. A step closer.</p>
        </div>
        <div className="journey-points">
          <Star size={19} fill="currentColor" />
          <strong>{total * 20}</strong>
          <span>study points</span>
        </div>
      </div>
      <div className="journey-layout">
        <div className="journey-main">
          <div
            className="unit-picker"
            role="group"
            aria-label="Choose a learning unit"
          >
            {units.map((u, index) => (
              <button
                key={u.id}
                aria-pressed={u.id === unit.id}
                onClick={() =>
                  update((s) => ({
                    ...s,
                    journey: { ...s.journey, unit: u.id },
                  }))
                }
              >
                <span>0{index + 1}</span>
                {u.topic}
                {stageKinds.every((k) =>
                  state.journey.completed.includes(u.id + ":" + k),
                ) && <Check size={15} />}
              </button>
            ))}
          </div>
          <section className="unit-banner" aria-labelledby="unit-title">
            <div>
              <span className="unit-kicker">
                UNIT 0{units.indexOf(unit) + 1} <span>·</span> NPREP STUDY NOTES
              </span>
              <h2 id="unit-title">{unit.title}</h2>
              <p>{unit.subtitle}</p>
              <div className="unit-progress">
                <progress
                  aria-label={unit.topic + " stages completed"}
                  value={completed}
                  max={5}
                />
                <span>{completed} / 5 stages</span>
              </div>
            </div>
            <StudyNotes />
          </section>
          <section
            className="chapter-outline"
            aria-label={unit.topic + " chapter outline"}
          >
            <div className="chapter-caption">
              <span>IN THIS CHAPTER</span>
              <span>Five focused sessions · one connected topic</span>
            </div>
            <ol className="chapter-lessons">
              {stageKinds.map((kind, index) => {
                const id = unit.id + ":" + kind;
                const done = state.journey.completed.includes(id);
                const available = stageAvailable(state, id);
                const current = !done && available;
                const Icon = icons[kind];
                const info = stageInfo[kind];
                return (
                  <li key={id} className="lesson-entry">
                    <button
                      className={
                        "lesson-entry-button " +
                        (done
                          ? "is-done"
                          : current
                            ? "is-current"
                            : "is-upcoming")
                      }
                      disabled={!available}
                      onClick={() => start(id)}
                      aria-label={
                        info.type +
                        ": " +
                        info.label +
                        (done
                          ? ", completed, replay"
                          : available
                            ? ""
                            : ", complete the previous stage to unlock")
                      }
                    >
                      <span className="lesson-index" aria-hidden="true">
                        0{index + 1}
                      </span>
                      <span className="lesson-summary">
                        <span className="lesson-category">
                          <Icon size={14} />
                          {info.type}
                          <span className="lesson-time">
                            <Clock3 size={12} />
                            {info.minutes}
                          </span>
                        </span>
                        <strong>{info.label}</strong>
                        <span className="lesson-detail">{info.detail}</span>
                        {current && (
                          <span className="lesson-current-note">
                            Ready when you are
                          </span>
                        )}
                      </span>
                      <span className="lesson-entry-action">
                        {done ? (
                          <>
                            <Check size={17} />
                            <span>Revisit</span>
                          </>
                        ) : current ? (
                          <>
                            <span>Open lesson</span>
                            <ArrowRight size={19} />
                          </>
                        ) : (
                          <>
                            <LockKeyhole size={14} />
                            <span>Up next</span>
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div
              className={"unit-finish " + (completed === 5 ? "is-earned" : "")}
            >
              <span>
                <Trophy size={24} />
              </span>
              <div>
                <strong>
                  {completed === 5
                    ? "A milestone worth celebrating."
                    : "A little milestone awaits."}
                </strong>
                <p>
                  {completed === 5
                    ? "Unit complete. Revisit any stage or explore another topic."
                    : "Finish all five stages to earn your unit badge."}
                </p>
              </div>
              {completed === 5 && <Check size={20} />}
            </div>
          </section>
          <p className="journey-preview">
            Sample learning paths · 9 source-linked questions · Not an
            exam-readiness score
          </p>
        </div>
        <aside className="journey-aside">
          <section className="journey-next">
            <span className="journey-card-icon">
              <Flag size={22} />
            </span>
            <p className="journey-eyebrow">YOUR NEXT SMALL WIN</p>
            <h2>
              {completed === 5
                ? "Look how far you’ve come."
                : stageInfo[nextKind ?? "checkpoint"].label}
            </h2>
            <p>
              {completed === 5
                ? "Keep it fresh with a replay, or choose your next unit."
                : stageInfo[nextKind ?? "checkpoint"].detail}
            </p>
            <Button onClick={() => start(nextId)}>
              {completed === 5
                ? "Replay checkpoint"
                : activeRun?.stageId === nextId && !activeRun.finished
                  ? "Continue stage"
                  : "Let’s learn"}
              <ArrowRight size={17} />
            </Button>
            <span className="journey-time-note">
              <Clock3 size={13} /> Just a few minutes for yourself
            </span>
          </section>
          {activeRun && !activeRun.finished && activeRun.stageId !== nextId && (
            <section className="journey-resume">
              <strong>You have a stage in progress</strong>
              <p>
                {getStage(activeRun.stageId)?.unit.topic} ·{" "}
                {getStage(activeRun.stageId)?.label}
              </p>
              <Button variant="outline" onClick={() => setOpen(true)}>
                Pick up where I left off <ArrowRight size={15} />
              </Button>
            </section>
          )}
          <section className="journey-habit">
            <div>
              <span className="journey-card-icon gold">
                <Star size={21} />
              </span>
              <h3>Every step counts.</h3>
            </div>
            <p>
              Earn 20 study points for each new stage. Replays keep ideas fresh;
              your points never reset.
            </p>
            <div className="journey-mini-stats">
              <strong>
                {total}
                <span>stages finished</span>
              </strong>
              <strong>
                {
                  units.filter((u) =>
                    state.journey.completed.includes(u.id + ":checkpoint"),
                  ).length
                }
                <span>unit badges</span>
              </strong>
            </div>
          </section>
          <section className="journey-shortcuts">
            <button onClick={goRevision}>
              <span>
                <RotateCcw size={19} />
                <span>
                  <strong>A second look</strong>
                  <small>Revisit mistakes and saved questions</small>
                </span>
              </span>
              <ChevronRight size={18} />
            </button>
            <button onClick={goPractice}>
              <span>
                <BookOpen size={19} />
                <span>
                  <strong>Explore freely</strong>
                  <small>Jump into any practice topic</small>
                </span>
              </span>
              <ChevronRight size={18} />
            </button>
          </section>
          <div className="journey-kindness">
            <Leaf size={20} />
            <p>
              You don’t have to do it all today.
              <br />
              <strong>Just take the next small step.</strong>
            </p>
          </div>
        </aside>
      </div>
      <JourneyPlayer open={open} onOpenChange={setOpen} />
      <Dialog
        open={!!pending}
        onOpenChange={(o) => {
          if (!o) setPending(null);
        }}
        title="Pick up or start fresh?"
        description="A different stage is in progress. Starting this stage replaces that unfinished stage; checked answers and completed stages stay saved."
      >
        <div className="confirm-actions">
          <Button
            variant="outline"
            onClick={() => {
              setPending(null);
              setOpen(true);
            }}
          >
            Continue existing stage
          </Button>
          <Button
            onClick={() => {
              if (pending) begin(pending);
              setPending(null);
            }}
          >
            Start this stage
          </Button>
        </div>
      </Dialog>
    </>
  );
}

function JourneyPlayer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { state, update } = useLearning();
  const run = state.journey.run;
  const stage = run && getStage(run.stageId);
  if (!run || !stage) return null;
  const passed =
    stage.kind !== "checkpoint" ||
    run.answers.filter((a) => a.correct).length >= 2;
  const length = stageQuestions(run.stageId).length;
  const nextKind = stageKinds[stageKinds.indexOf(stage.kind) + 1];
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={stage.label}
      description={
        stage.unit.topic +
        " · " +
        stage.type.toLowerCase() +
        " · " +
        stage.minutes
      }
      className="journey-dialog"
    >
      {run.finished ? (
        <div className="stage-result" role="status">
          <span className={"stage-result-icon " + (!passed ? "try-again" : "")}>
            {passed ? <Trophy size={44} /> : <Leaf size={44} />}
          </span>
          <p className="journey-eyebrow">
            {passed ? "ONE MORE STEP FORWARD" : "THERE’S ROOM TO GROW"}
          </p>
          <h3>
            {passed
              ? stage.kind === "checkpoint"
                ? "Your unit badge is here!"
                : "That’s a little win."
              : "Let’s give that another go."}
          </h3>
          <p>
            {passed
              ? "Stage complete. Your progress is saved on this device."
              : "You need 2 out of 3 correct. Review the ideas and try again whenever you’re ready."}
          </p>
          {run.answers.length > 0 && (
            <div className="stage-score">
              <strong>
                {run.answers.filter((a) => a.correct).length} /{" "}
                {run.answers.length}
              </strong>
              <span>correct this time</span>
            </div>
          )}
          <div className="stage-result-actions">
            {!passed ? (
              <Button onClick={() => update((s) => startStage(s, run.stageId))}>
                Try checkpoint again <RotateCcw size={17} />
              </Button>
            ) : nextKind ? (
              <Button
                onClick={() =>
                  update((s) => startStage(s, stage.unit.id + ":" + nextKind))
                }
              >
                Next stage <ArrowRight size={17} />
              </Button>
            ) : (
              <Button onClick={() => onOpenChange(false)}>
                Back to my path <Flag size={17} />
              </Button>
            )}
            {(nextKind || !passed) && (
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Back to my path
              </Button>
            )}
          </div>
          <small>
            Study points are awarded once per stage. Take a break whenever you
            like.
          </small>
        </div>
      ) : (
        <>
          <div className="lesson-progress">
            <progress
              aria-label="Stage progress"
              value={run.step}
              max={length}
            />
            <span>
              {run.step + 1} / {length}
            </span>
          </div>
          <StageActivity key={run.id + ":" + run.step} kind={stage.kind} />
        </>
      )}
    </Dialog>
  );
}

function StageActivity({ kind }: { kind: StageKind }) {
  const { state, update } = useLearning();
  const [revealed, setRevealed] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<"sure" | "unsure">("sure");
  const [matchFeedback, setMatchFeedback] = useState<
    "correct" | "wrong" | null
  >(null);
  const run = state.journey.run!;
  const stage = getStage(run.stageId)!;
  const question = stageQuestions(run.stageId)[run.step];
  if (!question)
    return (
      <p>This stage is unavailable. Return to your path to start again.</p>
    );
  const answer = run.answers[run.step];
  const isLast = run.step + 1 === stageQuestions(run.stageId).length;
  const advance = () => update(advanceStage);
  const source = (
    <a
      className="lesson-source"
      href={question.source}
      target="_blank"
      rel="noreferrer"
    >
      Read the source: {question.sourceLabel} ↗
    </a>
  );
  if (kind === "learn")
    return (
      <div className="stage-activity">
        <p className="journey-eyebrow">PAUSE. THINK. TURN THE CARD.</p>
        <button
          className={"learning-card " + (revealed ? "is-revealed" : "")}
          aria-expanded={revealed}
          onClick={() => setRevealed(!revealed)}
        >
          <span className="learning-card-icon">
            <BookOpen size={28} />
          </span>
          <span>{revealed ? "THE IDEA TO KEEP" : "A LITTLE QUESTION"}</span>
          <strong>{revealed ? question.explanation : question.title}</strong>
          <small>
            <RotateCcw size={14} />{" "}
            {revealed ? "Tap to see the question" : "Tap to reveal the idea"}
          </small>
        </button>
        {source}
        <div className="lesson-actions">
          <span>No rush. Let the idea settle.</span>
          <Button disabled={!revealed} onClick={advance}>
            {isLast ? "Finish learning" : "Next idea"}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  if (kind === "match") {
    const pair = stage.unit.pairs[run.step];
    const order = [2, 0, 1];
    return (
      <div className="stage-activity">
        <p className="journey-eyebrow">MAKE A CONNECTION</p>
        <h3 className="match-term">{pair[0]}</h3>
        <p className="lesson-instruction">Choose the matching meaning.</p>
        <fieldset className="journey-options">
          <legend className="sr-only">Meaning of {pair[0]}</legend>
          {order.map((i) => (
            <label
              key={i}
              className={
                (choice === i ? "is-selected " : "") +
                (matchFeedback === "correct" && i === run.step
                  ? "is-correct"
                  : "")
              }
            >
              <input
                type="radio"
                name="meaning"
                checked={choice === i}
                disabled={matchFeedback === "correct"}
                onChange={() => {
                  setChoice(i);
                  setMatchFeedback(null);
                }}
              />
              <span>{stage.unit.pairs[i][1]}</span>
              {matchFeedback === "correct" && i === run.step && (
                <Check size={18} />
              )}
            </label>
          ))}
        </fieldset>
        {matchFeedback && (
          <div className="lesson-feedback" role="status">
            <strong>
              {matchFeedback === "correct"
                ? "A connection made."
                : "Not quite. Try another pairing."}
            </strong>
            <p>
              {matchFeedback === "correct"
                ? pair[0] + ": " + pair[1] + "."
                : "Use the learning cards as a guide. You can try as often as you need."}
            </p>
          </div>
        )}
        {source}
        <div className="lesson-actions">
          <span>Pair {run.step + 1} of 3</span>
          {matchFeedback === "correct" ? (
            <Button onClick={advance}>
              {isLast ? "Finish matching" : "Next pair"}
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              disabled={choice === null}
              onClick={() =>
                setMatchFeedback(choice === run.step ? "correct" : "wrong")
              }
            >
              Check match <Check size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="stage-activity">
      <p className="journey-eyebrow">
        {kind === "checkpoint"
          ? "BRING IT ALL TOGETHER · 2 OF 3 TO PASS"
          : "A LITTLE PRACTICE GOES A LONG WAY"}
      </p>
      <h3 className="lesson-question">{question.title}</h3>
      <fieldset className="journey-options">
        <legend className="sr-only">Choose your answer</legend>
        {question.options.map((option, i) => (
          <label
            key={option}
            className={
              (answer
                ? answer.choice === i
                  ? "is-selected "
                  : ""
                : choice === i
                  ? "is-selected "
                  : "") + (answer && question.answer === i ? "is-correct" : "")
            }
          >
            <input
              type="radio"
              name="answer"
              checked={(answer?.choice ?? choice) === i}
              disabled={!!answer}
              onChange={() => setChoice(i)}
            />
            <span>{option}</span>
            {answer && question.answer === i && <Check size={18} />}
          </label>
        ))}
      </fieldset>
      {!answer && (
        <fieldset className="journey-confidence">
          <legend>How does that feel?</legend>
          <label>
            <input
              type="radio"
              name="confidence"
              checked={confidence === "sure"}
              onChange={() => setConfidence("sure")}
            />{" "}
            Feeling sure
          </label>
          <label>
            <input
              type="radio"
              name="confidence"
              checked={confidence === "unsure"}
              onChange={() => setConfidence("unsure")}
            />{" "}
            Still learning
          </label>
        </fieldset>
      )}
      {answer && (
        <div className="lesson-feedback" role="status">
          <strong>
            {answer.correct ? "You’ve got it." : "A good moment to learn."}
          </strong>
          <p>{question.explanation}</p>
          {(!answer.correct || answer.confidence === "unsure") && (
            <small>Added to your revision queue for another look.</small>
          )}
          {source}
        </div>
      )}
      <div className="lesson-actions">
        <span>Checked answers save automatically.</span>
        {answer ? (
          <Button onClick={advance}>
            {isLast ? "Finish stage" : "Next question"}
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            disabled={choice === null}
            onClick={() => {
              if (choice !== null)
                update((s) => answerStage(s, choice, confidence));
            }}
          >
            Check answer <Check size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
