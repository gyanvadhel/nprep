"use client";
import { useState } from "react";
import { Tabs } from "radix-ui";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  RotateCcw,
  Search,
  Target,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sprout } from "./study-art";
import { TopicCard, topicIcons } from "./dashboard";
import {
  accuracy,
  dayKey,
  daysThisWeek,
  type LearningState,
} from "@/lib/learning";
import { questions, topics, questionById } from "@/lib/questions";
import { useToday } from "@/lib/use-today";
import { updateLearning } from "@/lib/store";
const ProgressChart = dynamic(() => import("./progress-chart"), {
  ssr: false,
  loading: () => (
    <div className="chart-placeholder">Loading your activity…</div>
  ),
});
type Start = (ids: string[], label: string) => void;
export function PracticeView({
  state,
  start,
}: {
  state: LearningState;
  start: Start;
}) {
  const [filter, setFilter] = useState("All topics");
  const [search, setSearch] = useState("");
  const list = questions.filter(
    (q) =>
      (filter === "All topics" || q.topic === filter) &&
      (q.title + " " + q.topic)
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  return (
    <>
      <ViewIntro
        label="MAKE SPACE FOR UNDERSTANDING"
        title="Find your focus."
        description="Follow your curiosity. Build confidence one concept at a time."
      />
      <div className="practice-feature">
        <div>
          <span className="eyebrow">A LITTLE BIT OF EVERYTHING</span>
          <h2>Mix it up. Connect the dots.</h2>
          <p>Explore all three topics in one gentle practice session.</p>
        </div>
        <Button
          onClick={() =>
            start(
              questions.map((q) => q.id),
              "Mixed practice",
            )
          }
        >
          Start mixed practice <ArrowRight size={16} />
        </Button>
      </div>
      <div className="topic-cards practice-topics">
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
      <section className="panel question-library">
        <div className="section-heading">
          <div>
            <h2>Your practice library</h2>
            <p className="muted">
              9 sample questions · Source-linked explanations
            </p>
          </div>
          <span className="small-badge">PREVIEW COLLECTION</span>
        </div>
        <div className="library-controls">
          <div className="filter-chips" aria-label="Filter by topic">
            {["All topics", ...topics.map((t) => t.name)].map((t) => (
              <button
                key={t}
                aria-pressed={filter === t}
                className={filter === t ? "active" : ""}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <label className="search-field">
            <Search size={16} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a concept…"
              aria-label="Search questions"
            />
          </label>
        </div>
        {list.length ? (
          <div className="question-list">
            {list.map((q) => {
              const last = [...state.attempts]
                .reverse()
                .find((a) => a.questionId === q.id);
              return (
                <button
                  key={q.id}
                  className="question-row"
                  onClick={() => start([q.id], q.topic + " practice")}
                >
                  <span
                    className={
                      "question-row-icon " + (last?.correct ? "answered" : "")
                    }
                  >
                    {last?.correct ? (
                      <CheckCircle2 size={19} />
                    ) : (
                      <BookOpen size={19} />
                    )}
                  </span>
                  <div>
                    <span className="question-topic">{q.topic}</span>
                    <h3>{q.title}</h3>
                  </div>
                  <ChevronRight size={18} />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="empty-search">
            <Search size={28} />
            <h3>No questions found.</h3>
            <p>Try another word or choose a different topic.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setFilter("All topics");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
export function RevisionView({
  state,
  start,
  goPractice,
}: {
  state: LearningState;
  start: Start;
  goPractice: () => void;
}) {
  const [tab, setTab] = useState<"review" | "saved">("review");
  const reviewIds = Object.keys(state.reviews).filter((id) => questionById(id));
  const ids =
    tab === "review"
      ? reviewIds
      : state.bookmarks.filter((id) => questionById(id));
  const due = reviewIds.filter(
    (id) => state.reviews[id].dueAt <= new Date().toISOString(),
  ).length;
  return (
    <>
      <ViewIntro
        label="MAKE IT STICK"
        title="Good things take a second look."
        description="A personal space for the concepts you’re still getting to know."
      />
      <div className="revision-summary">
        <div className="revision-summary-icon">
          <RotateCcw size={29} />
        </div>
        <div>
          <h2>
            {due
              ? due +
                (due === 1 ? " question is" : " questions are") +
                " ready for you."
              : "A little repetition. A lot more confidence."}
          </h2>
          <p>
            {due
              ? "Your scheduled revision is due. You can also revisit any question early."
              : "Mistakes and unsure answers return tomorrow, then after confident answers at 3 and 7 days."}
          </p>
        </div>
        {due > 0 && (
          <Button
            onClick={() =>
              start(
                reviewIds.filter(
                  (id) => state.reviews[id].dueAt <= new Date().toISOString(),
                ),
                "Scheduled revision",
              )
            }
          >
            Revise now <ArrowRight size={16} />
          </Button>
        )}
      </div>
      <Tabs.Root
        className="panel revision-library"
        value={tab}
        onValueChange={(value) => setTab(value as "review" | "saved")}
      >
        <Tabs.List className="revision-tabs" aria-label="Revision collections">
          <Tabs.Trigger
            value="review"
            className={tab === "review" ? "active" : ""}
          >
            <RotateCcw size={17} /> To revisit <span>{reviewIds.length}</span>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="saved"
            className={tab === "saved" ? "active" : ""}
          >
            <Bookmark size={17} /> Saved questions{" "}
            <span>{state.bookmarks.length}</span>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value={tab}>
          {ids.length ? (
            <div className="revision-list">
              <div className="revision-list-header">
                <p>
                  {tab === "review"
                    ? "You can revisit these any time."
                    : "A collection of things worth keeping."}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    start(
                      ids,
                      tab === "review" ? "My revision" : "Saved questions",
                    )
                  }
                >
                  Practise all <ArrowRight size={14} />
                </Button>
              </div>
              {ids.map((id) => {
                const q = questionById(id)!;
                const review = state.reviews[id];
                return (
                  <div className="saved-row" key={id}>
                    <div>
                      <span className="question-topic">{q.topic}</span>
                      <h3>{q.title}</h3>
                      {tab === "review" && (
                        <small>
                          <Clock3 size={12} />{" "}
                          {review.dueAt <= new Date().toISOString()
                            ? "Ready to revisit"
                            : "Next review: " +
                              new Intl.DateTimeFormat("en-IN", {
                                timeZone: "Asia/Kolkata",
                                day: "numeric",
                                month: "short",
                              }).format(new Date(review.dueAt))}
                        </small>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => start([id], "A second look")}
                    >
                      Practise <ArrowRight size={15} />
                    </Button>
                    {tab === "saved" && (
                      <button
                        className="icon-button"
                        aria-label={"Remove bookmark: " + q.title}
                        onClick={() =>
                          updateLearning((s) => ({
                            ...s,
                            bookmarks: s.bookmarks.filter((b) => b !== id),
                          }))
                        }
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="large-empty">
              <Sprout />
              <h2>
                {tab === "review"
                  ? "Your understanding has room to grow."
                  : "Keep the questions that make you think."}
              </h2>
              <p>
                {tab === "review"
                  ? "Answer a few questions. Mistakes and answers you’re unsure about will appear here, ready for a second look."
                  : "Tap the bookmark in any practice question. You’ll find it here whenever you need it."}
              </p>
              <Button onClick={goPractice}>
                Explore practice <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}
export function ProgressView({
  state,
  goPractice,
}: {
  state: LearningState;
  goPractice: () => void;
}) {
  const today = useToday();
  const week = daysThisWeek(new Date((today || "2000-01-03") + "T12:00:00Z"));
  const data = week.map((d, i) => ({
    label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    questions: state.attempts.filter((a) => dayKey(a.at) === d.key).length,
  }));
  const unique = new Set(state.attempts.map((a) => a.questionId)).size;
  return (
    <>
      <ViewIntro
        label="LOOK HOW FAR YOU’RE COMING"
        title="Small steps. Real progress."
        description="An honest picture of your practice, with plenty of room to grow."
      />
      <div className="progress-overview">
        <div className="panel">
          <BookOpen size={21} />
          <strong>{state.attempts.length}</strong>
          <span>Total attempts</span>
        </div>
        <div className="panel">
          <Target size={21} />
          <strong>
            {state.attempts.length ? accuracy(state.attempts) + "%" : "—"}
          </strong>
          <span>Overall accuracy</span>
        </div>
        <div className="panel">
          <CheckCircle2 size={21} />
          <strong>
            {unique}
            <small> / {questions.length}</small>
          </strong>
          <span>Sample questions explored</span>
        </div>
      </div>
      <div className="progress-layout">
        <section className="panel activity-panel">
          <div className="section-heading">
            <div>
              <h2>A week of showing up</h2>
              <p className="muted">Questions answered each day · India time</p>
            </div>
          </div>
          <ProgressChart data={data} />
          <details className="chart-data">
            <summary>View activity as a table</summary>
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Questions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.label}>
                    <td>{d.label}</td>
                    <td>{d.questions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>
        <section className="panel subject-progress">
          <h2>Your foundations</h2>
          <p className="muted">Accuracy across attempts in each topic.</p>
          {topics.map((topic) => {
            const attempts = state.attempts.filter(
              (a) => questionById(a.questionId)?.topic === topic.name,
            );
            const Icon = topicIcons[topic.name];
            return (
              <div className="subject-progress-row" key={topic.name}>
                <div>
                  <span>
                    <Icon size={17} />
                    {topic.name}
                  </span>
                  <strong>
                    {attempts.length ? accuracy(attempts) + "%" : "—"}
                  </strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: accuracy(attempts) + "%" }} />
                </div>
                <small>
                  {attempts.length}{" "}
                  {attempts.length === 1 ? "attempt" : "attempts"}
                </small>
              </div>
            );
          })}
          <p className="progress-footnote">
            These reflect this sample library, not overall NORCET readiness.
          </p>
        </section>
      </div>
      <section className="panel recent-activity">
        <div className="section-heading">
          <h2>Your recent practice</h2>
          <span className="small-badge">ON THIS DEVICE</span>
        </div>
        {state.attempts.length ? (
          [...state.attempts]
            .reverse()
            .slice(0, 6)
            .map((a) => (
              <div className="activity-row" key={a.id}>
                <span
                  className={"activity-dot " + (a.correct ? "correct" : "")}
                >
                  {a.correct ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <RotateCcw size={17} />
                  )}
                </span>
                <div>
                  <h3>
                    {questionById(a.questionId)?.title ?? "Archived question"}
                  </h3>
                  <p>
                    {a.correct ? "Correct" : "Added to revision"} ·{" "}
                    {a.confidence === "sure"
                      ? "Confident"
                      : "Still building confidence"}
                  </p>
                </div>
                <time dateTime={a.at}>
                  {new Intl.DateTimeFormat("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                    month: "short",
                  }).format(new Date(a.at))}
                </time>
              </div>
            ))
        ) : (
          <div className="progress-empty">
            <p>Your first attempt is the start of your story.</p>
            <Button variant="outline" onClick={goPractice}>
              Answer your first question <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
function ViewIntro({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro">
      <div>
        <div className="greeting">{label}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
