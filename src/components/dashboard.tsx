"use client";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Flame,
  HeartPulse,
  Leaf,
  RotateCcw,
  Sparkles,
  Sun,
  Target,
  Wind,
} from "lucide-react";
import { Button } from "./ui/button";
import { StudyArt, Sprout } from "./study-art";
import {
  accuracy,
  dayKey,
  daysThisWeek,
  streak,
  type LearningState,
} from "@/lib/learning";
import { useToday } from "@/lib/use-today";
import { questions, topics } from "@/lib/questions";

export const topicIcons = {
  Anatomy: BookOpen,
  Blood: HeartPulse,
  Respiration: Wind,
};
type Props = {
  state: LearningState;
  start: (ids: string[], label: string) => void;
  resume: () => void;
  navigate: (tab: "practice" | "revision" | "progress") => void;
};
export function Dashboard({ state, start, resume, navigate }: Props) {
  const today = useToday();
  const todayCount = state.attempts.filter(
    (a) => dayKey(a.at) === today,
  ).length;
  const week = daysThisWeek(new Date((today || "2000-01-03") + "T12:00:00Z"));
  const activeDays = new Set(state.attempts.map((a) => dayKey(a.at)));
  const weekCount = state.attempts.filter((a) =>
    week.some((d) => d.key === dayKey(a.at)),
  ).length;
  const pending = state.session && !state.session.complete;
  const reviewCount = Object.keys(state.reviews).length;
  const dailyIds = questions
    .filter(
      (q) =>
        state.reviews[q.id] &&
        state.reviews[q.id].dueAt <= new Date().toISOString(),
    )
    .map((q) => q.id);
  const unseen = questions
    .filter((q) => !state.attempts.some((a) => a.questionId === q.id))
    .map((q) => q.id);
  const selection = [
    ...new Set([...dailyIds, ...unseen, ...questions.map((q) => q.id)]),
  ].slice(0, Math.min(state.dailyGoal, questions.length));
  return (
    <>
      <div className="page-intro">
        <div>
          <div className="greeting">
            <Sun size={16} /> A FRESH CHANCE TO GROW
          </div>
          <h1>
            {state.name
              ? "A little progress, " + state.name + "."
              : "A little better, every day."}
          </h1>
          <p>Your nursing journey. Your pace. Let’s take the next step.</p>
        </div>
        <span className="date-label">
          {today
            ? new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                weekday: "short",
                day: "numeric",
                month: "short",
              }).format(new Date(today + "T12:00:00Z"))
            : "Your daily practice"}
        </span>
      </div>
      <div className="dashboard-grid">
        <div className="main-column">
          <section className="daily-hero">
            <div className="hero-copy">
              <span className="hero-tag">
                <span /> YOUR DAILY PRACTICE
              </span>
              <h2>
                Your daily dose
                <br />
                of <em>confidence.</em>
              </h2>
              <p>
                A few questions. A fresh perspective.
                <br />
                One step closer to the nurse you’ll become.
              </p>
              <Button
                onClick={() =>
                  pending ? resume() : start(selection, "Your daily practice")
                }
              >
                {pending ? "Continue my session" : "Let’s practise"}{" "}
                <ArrowRight size={17} />
              </Button>
              <div className="hero-footnote">
                <span>
                  {pending
                    ? state.session!.questionIds.length
                    : selection.length}{" "}
                  questions
                </span>
                <i /> <span>At your own pace</span>
                <i />
                <span>Always free</span>
              </div>
            </div>
            <StudyArt />
          </section>
          <div className="stats-grid">
            <Stat
              icon={<BookOpen size={19} />}
              label="Questions answered"
              value={String(state.attempts.length)}
              detail="Every attempt counts"
              tone="green"
            />
            <Stat
              icon={<Target size={19} />}
              label="Your accuracy"
              value={
                state.attempts.length ? accuracy(state.attempts) + "%" : "—"
              }
              detail={
                state.attempts.length
                  ? "Across all your practice"
                  : "Let’s find your starting point"
              }
              tone="orange"
            />
            <Stat
              icon={<Flame size={19} />}
              label="Current streak"
              value={
                streak(state.attempts) +
                (streak(state.attempts) === 1 ? " day" : " days")
              }
              detail={
                state.attempts.length
                  ? "Keep showing up for yourself"
                  : "A fresh start looks good on you"
              }
              tone="purple"
            />
          </div>
          <section className="topics-section">
            <div className="section-heading">
              <div>
                <h2>Find your focus</h2>
                <p>A strong foundation starts with the basics.</p>
              </div>
              <button
                className="text-button"
                onClick={() => navigate("practice")}
              >
                All practice <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="topic-cards">
              {topics.map((topic) => (
                <TopicCard
                  key={topic.name}
                  topic={topic}
                  state={state}
                  onClick={() =>
                    start(
                      questions
                        .filter((q) => q.topic === topic.name)
                        .map((q) => q.id),
                      topic.name + " practice",
                    )
                  }
                />
              ))}
            </div>
          </section>
          <section className="little-reminder">
            <span className="reminder-icon">
              <Leaf size={23} />
            </span>
            <div>
              <h3>Consistency has a quiet kind of magic.</h3>
              <p>
                Even five minutes today is an investment in your future self.
              </p>
            </div>
            <span className="reminder-flower" aria-hidden="true">
              ✳
            </span>
          </section>
          <div className="library-note">
            <BookOpen size={14} />
            <span>
              Preview library · {questions.length} sample questions with source
              references
            </span>
          </div>
        </div>
        <aside className="right-column">
          <section className="panel week-panel">
            <div className="section-heading">
              <h2>Your little wins</h2>
              <span className="week-flame">
                <Flame size={18} />
              </span>
            </div>
            <p className="muted">One day at a time adds up.</p>
            <div className="week-days">
              {week.map((day) => (
                <div key={day.key}>
                  <span>{day.label}</span>
                  <div
                    className={
                      "day-circle " +
                      (activeDays.has(day.key)
                        ? "done"
                        : day.key === today
                          ? "today"
                          : "")
                    }
                    aria-label={
                      day.key +
                      (activeDays.has(day.key)
                        ? ", practised"
                        : day.key === today
                          ? ", today"
                          : "")
                    }
                  >
                    {activeDays.has(day.key) ? (
                      <Check size={15} />
                    ) : today ? (
                      day.date
                    ) : (
                      "·"
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="weekly-total">
              <span>
                <strong>{weekCount}</strong> questions this week
              </span>
              <Sparkles size={16} />
            </div>
            <div className="daily-goal">
              <div>
                <span>Today’s small goal</span>
                <strong>
                  {Math.min(todayCount, state.dailyGoal)} / {state.dailyGoal}
                </strong>
              </div>
              <div className="progress-track">
                <span
                  style={{
                    width:
                      Math.min((todayCount / state.dailyGoal) * 100, 100) + "%",
                  }}
                />
              </div>
              <small>
                {todayCount >= state.dailyGoal
                  ? "You made time for yourself. Well done!"
                  : "A little effort. A meaningful difference."}
              </small>
            </div>
          </section>
          <section className="panel revision-panel">
            <div className="section-heading">
              <h2>A second look</h2>
              <RotateCcw size={17} />
            </div>
            {reviewCount ? (
              <>
                <div className="review-count">
                  {reviewCount}
                  <span>
                    {reviewCount === 1 ? "question" : "questions"} to revisit
                  </span>
                </div>
                <p className="muted">
                  Some concepts deserve another moment. Your revision queue is
                  ready.
                </p>
                <Button variant="outline" onClick={() => navigate("revision")}>
                  Open my revision <ArrowRight size={15} />
                </Button>
              </>
            ) : (
              <>
                <div className="revision-empty-art">
                  <div>
                    <BookOpen size={29} />
                    <span>
                      <Check size={12} />
                    </span>
                  </div>
                </div>
                <h3>A fresh page, just for you.</h3>
                <p className="muted">
                  Your mistakes and unsure answers will find a home here.
                </p>
                <button
                  className="text-button"
                  onClick={() => navigate("revision")}
                >
                  How revision works <ChevronRight size={14} />
                </button>
              </>
            )}
          </section>
          <section className="gentle-note">
            <div>
              <span className="eyebrow">A GENTLE REMINDER</span>
              <p>
                You don’t have to know
                <br />
                everything.
                <br />
                <em>
                  Just a little more
                  <br />
                  than yesterday.
                </em>
              </p>
            </div>
            <Sprout />
          </section>
        </aside>
      </div>
    </>
  );
}
function Stat({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className={"stat-icon " + tone}>{icon}</span>
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}
export function TopicCard({
  topic,
  state,
  onClick,
}: {
  topic: (typeof topics)[number];
  state: LearningState;
  onClick: () => void;
}) {
  const Icon = topicIcons[topic.name];
  const bank = questions.filter((q) => q.topic === topic.name);
  const seen = bank.filter((q) =>
    state.attempts.some((a) => a.questionId === q.id),
  ).length;
  return (
    <button className={"topic-card " + topic.className} onClick={onClick}>
      <div className="topic-top">
        <span className="topic-icon">
          <Icon size={23} strokeWidth={1.6} />
        </span>
        <ArrowUpRight size={17} />
      </div>
      <span className="topic-overline">{topic.label}</span>
      <h3>{topic.name}</h3>
      <p>{topic.description}</p>
      <div className="topic-bottom">
        <span>{bank.length} sample questions</span>
        <span>
          {seen}/{bank.length} explored
        </span>
      </div>
      <div className="topic-track">
        <span style={{ width: (seen / bank.length) * 100 + "%" }} />
      </div>
    </button>
  );
}
