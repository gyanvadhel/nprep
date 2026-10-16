"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLearning } from "@/lib/store";
import {
  accuracy,
  nextQuestion,
  recordAnswer,
  type Confidence,
} from "@/lib/learning";
import { questionById } from "@/lib/questions";

export function QuestionPlayer({
  open,
  onOpenChange,
  onRevision,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevision: () => void;
}) {
  const { state } = useLearning();
  const s = state.session;
  if (!s) return null;
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={s.complete ? "A little better than before." : s.label}
      description={
        s.complete
          ? "Every question is a step forward. Here is how you did."
          : "Sample practice · Take your time. Understanding comes first."
      }
      className="quiz-dialog"
    >
      {s.complete ? (
        <div className="session-results">
          <div className="result-symbol">
            <Sparkles size={34} />
          </div>
          <p className="eyebrow">SESSION COMPLETE</p>
          <h2>You showed up. That matters.</h2>
          <div className="result-stats">
            <div>
              <strong>
                {s.answers.filter((a) => a.correct).length}
                <small>/{s.questionIds.length}</small>
              </strong>
              <span>Correct answers</span>
            </div>
            <div>
              <strong>
                {accuracy(s.answers)}
                <small>%</small>
              </strong>
              <span>Session accuracy</span>
            </div>
            <div>
              <strong>
                {
                  s.answers.filter(
                    (a) => !a.correct || a.confidence === "unsure",
                  ).length
                }
              </strong>
              <span>Added to revision</span>
            </div>
          </div>
          <div className="result-note">
            <Lightbulb size={19} />
            <p>
              Your mistakes and uncertain answers are saved for another look.
              Coming back to them is part of learning.
            </p>
          </div>
          <div className="result-actions">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Back to my day
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false);
                onRevision();
              }}
            >
              Visit revision <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <QuestionStep key={s.id + ":" + s.index} />
      )}
    </Dialog>
  );
}
function QuestionStep() {
  const { state, update } = useLearning();
  const session = state.session!;
  const q = questionById(session.questionIds[session.index]);
  const existing = session.answers.find((a) => a.questionId === q?.id);
  const [choice, setChoice] = useState<number | null>(existing?.choice ?? null);
  const [confidence, setConfidence] = useState<Confidence>(
    existing?.confidence ?? "unsure",
  );
  const reduced = useReducedMotion();
  if (!q)
    return (
      <p>This question is no longer available. Please start a new session.</p>
    );
  const saved = state.bookmarks.includes(q.id);
  const progress = (session.answers.length / session.questionIds.length) * 100;
  function toggleBookmark() {
    update((s) => ({
      ...s,
      bookmarks: saved
        ? s.bookmarks.filter((id) => id !== q!.id)
        : [...s.bookmarks, q!.id],
    }));
  }
  return (
    <div className="question-step">
      <div className="quiz-meta">
        <span className="topic-pill">{q.topic}</span>
        <span>
          Question {session.index + 1} of {session.questionIds.length}
        </span>
        <button
          className={"icon-button bookmark-button " + (saved ? "is-saved" : "")}
          onClick={toggleBookmark}
          aria-label={saved ? "Remove saved question" : "Save question"}
          aria-pressed={saved}
        >
          <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Session progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <span style={{ width: progress + "%" }} />
      </div>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
      >
        <h2 className="question-title" id="question-title">
          {q.title}
        </h2>
        <fieldset
          className="answer-options"
          disabled={!!existing}
          aria-labelledby="question-title"
        >
          {q.options.map((option, i) => (
            <label
              key={option}
              className={
                "answer-option " +
                (choice === i ? "selected " : "") +
                (existing && q.answer === i ? "correct " : "") +
                (existing && choice === i && !existing.correct
                  ? "incorrect"
                  : "")
              }
            >
              <input
                type="radio"
                name="answer"
                value={i}
                checked={choice === i}
                onChange={() => setChoice(i)}
              />
              <span className="option-letter">
                {existing && q.answer === i ? (
                  <Check size={17} />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span>{option}</span>
              {existing && q.answer === i && (
                <span className="answer-label">Correct answer</span>
              )}
              {existing && choice === i && !existing.correct && (
                <span className="answer-label">Your answer</span>
              )}
            </label>
          ))}
        </fieldset>
      </motion.div>
      <AnimatePresence initial={false}>
        {existing ? (
          <motion.div
            className={"explanation " + (existing.correct ? "success" : "")}
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            role="status"
          >
            <div className="explanation-title">
              {existing.correct ? (
                <CheckCircle2 size={19} />
              ) : (
                <Lightbulb size={19} />
              )}
              <strong>
                {existing.correct
                  ? "You've got it."
                  : "A good moment to learn."}
              </strong>
            </div>
            <p>{q.explanation}</p>
            <a href={q.source} target="_blank" rel="noreferrer">
              {q.sourceLabel} <ExternalLink size={12} />
            </a>
            {(!existing.correct || existing.confidence === "unsure") && (
              <div className="revision-note">
                <RotateCcw size={13} /> Saved in your revision queue
              </div>
            )}
          </motion.div>
        ) : (
          <div className="confidence-row">
            <span>How confident are you?</span>
            <div className="segmented-control" aria-label="Answer confidence">
              <button
                aria-pressed={confidence === "unsure"}
                onClick={() => setConfidence("unsure")}
                className={confidence === "unsure" ? "active" : ""}
              >
                Still thinking
              </button>
              <button
                aria-pressed={confidence === "sure"}
                onClick={() => setConfidence("sure")}
                className={confidence === "sure" ? "active" : ""}
              >
                Feeling sure
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
      <div className="quiz-footer">
        <span>
          <Target size={14} /> Understanding over speed
        </span>
        {existing ? (
          <Button onClick={() => update(nextQuestion)}>
            {session.index + 1 === session.questionIds.length
              ? "See my results"
              : "Next question"}{" "}
            <ArrowRight size={17} />
          </Button>
        ) : (
          <Button
            disabled={choice === null}
            onClick={() => {
              if (choice !== null)
                update((s) => recordAnswer(s, choice, confidence));
            }}
          >
            Check answer <ArrowRight size={17} />
          </Button>
        )}
      </div>
    </div>
  );
}
