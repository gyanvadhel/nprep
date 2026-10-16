"use client";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Heart,
  House,
  Leaf,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Dashboard } from "./dashboard";
import { PracticeView, ProgressView, RevisionView } from "./learning-views";
import { QuestionPlayer } from "./question-player";
import { useLearning } from "@/lib/store";
import { makeSession } from "@/lib/learning";
type Tab = "today" | "practice" | "revision" | "progress";
const nav = [
  { id: "today" as const, label: "My day", icon: House },
  { id: "practice" as const, label: "Practice", icon: BookOpen },
  { id: "revision" as const, label: "Revision", icon: RotateCcw },
  { id: "progress" as const, label: "My progress", icon: BarChart3 },
];
export function LearningApp() {
  const reducedMotion = useReducedMotion();
  const { state, update, storageWarning } = useLearning();
  const [tab, setTab] = useState<Tab>("today");
  const [quizOpen, setQuizOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [help, setHelp] = useState(false);
  const [pending, setPending] = useState<{
    ids: string[];
    label: string;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const main = useRef<HTMLElement>(null);
  function navigate(next: Tab) {
    setTab(next);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => main.current?.focus({ preventScroll: true }));
  }
  function begin(ids: string[], label: string) {
    if (!ids.length) return;
    update((s) => ({ ...s, session: makeSession(ids, label) }));
    setQuizOpen(true);
  }
  function start(ids: string[], label: string) {
    if (state.session && !state.session.complete) setPending({ ids, label });
    else begin(ids, label);
  }
  function navItems(mobile = false) {
    return nav.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        className={
          (tab === id ? "active " : "") +
          (mobile ? "mobile-nav-item" : "nav-item")
        }
        onClick={() => navigate(id)}
        aria-current={tab === id ? "page" : undefined}
      >
        <Icon size={mobile ? 20 : 19} strokeWidth={1.75} />
        <span>{mobile && id === "progress" ? "Progress" : label}</span>
        {!mobile &&
          id === "revision" &&
          Object.keys(state.reviews).length > 0 && (
            <span className="nav-count">
              {Object.keys(state.reviews).length}
            </span>
          )}
        {!mobile && tab === id && <span className="nav-active-dot" />}
      </button>
    ));
  }
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="app-shell">
        <aside className="sidebar">
          <button
            className="brand"
            onClick={() => navigate("today")}
            aria-label="NPrep Daily home"
          >
            <span className="brand-mark">
              n<span />
            </span>
            <span>
              nprep<span className="brand-dot">.</span>
              <small>YOUR DAILY COMPANION</small>
            </span>
          </button>
          <div className="workspace-tag">
            <span>
              <Sparkles size={15} /> NORCET preparation
            </span>
            <span className="tiny-dot" />
          </div>
          <p className="nav-label">YOUR LEARNING SPACE</p>
          <nav aria-label="Main navigation">{navItems()}</nav>
          <div className="sidebar-separator" />
          <p className="nav-label">A LITTLE MORE</p>
          <a
            className="resource-link"
            href="https://nprep.in/"
            target="_blank"
            rel="noreferrer"
          >
            <span>
              <BookOpen size={18} /> Explore NPrep
            </span>
            <ArrowUpRight size={15} />
          </a>
          <button className="resource-link" onClick={() => setHelp(true)}>
            <span>
              <CircleHelp size={18} /> A helping hand
            </span>
          </button>
          <div className="sidebar-bottom">
            <div className="free-card">
              <span className="free-heart">
                <Heart size={21} />
              </span>
              <h3>
                A little learning.
                <br />
                For everyone.
              </h3>
              <p>
                Free to practise.
                <br />
                Free to keep growing.
              </p>
              <span className="free-label">
                <span /> ALWAYS FREE
              </span>
            </div>
            <div className="sidebar-footer">
              <span>Made with care, by NPrep</span>
              <Leaf size={13} />
            </div>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumbs">
              <span className="desktop-breadcrumb">
                Your learning space <span>/</span>
              </span>
              <strong>{nav.find((n) => n.id === tab)?.label}</strong>
            </div>
            <div className="topbar-actions">
              <span className="free-status">
                <span /> A little better, together
              </span>
              <button
                className="icon-button help-button"
                aria-label="About this companion"
                onClick={() => setHelp(true)}
              >
                <CircleHelp size={19} />
              </button>
              <div className="topbar-divider" />
              <button
                className="profile-button"
                aria-label="Personalise your learning"
                onClick={() => setSettings(true)}
              >
                <span className="avatar">
                  {state.name ? state.name[0].toUpperCase() : "Y"}
                </span>
                <ChevronDown size={13} />
              </button>
            </div>
          </header>
          <main
            className="main-content"
            id="main-content"
            tabIndex={-1}
            ref={main}
          >
            {storageWarning && (
              <div className="storage-warning" role="alert">
                {storageWarning}
              </div>
            )}
            {notice && (
              <div className="notice" role="status">
                <Check size={16} />
                {notice}
              </div>
            )}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                className="page-transition"
                key={tab}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: reducedMotion ? 1 : 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.12 }}
              >
                {tab === "today" && (
                  <Dashboard
                    state={state}
                    start={start}
                    resume={() => setQuizOpen(true)}
                    navigate={navigate}
                  />
                )}
                {tab === "practice" && (
                  <PracticeView state={state} start={start} />
                )}
                {tab === "revision" && (
                  <RevisionView
                    state={state}
                    start={start}
                    goPractice={() => navigate("practice")}
                  />
                )}
                {tab === "progress" && (
                  <ProgressView
                    state={state}
                    goPractice={() => navigate("practice")}
                  />
                )}
              </motion.div>
            </AnimatePresence>
            <footer className="workspace-footer">
              <span>
                <ShieldCheck size={13} /> Your learning history stays on this
                device.
              </span>
              <span>A little practice. A brighter tomorrow.</span>
            </footer>
          </main>
        </div>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems(true)}
      </nav>
      <QuestionPlayer
        open={quizOpen}
        onOpenChange={setQuizOpen}
        onRevision={() => navigate("revision")}
      />
      <Dialog
        open={settings}
        onOpenChange={setSettings}
        title="Make yourself at home."
        description="A few little details to make this space yours."
      >
        <form
          className="settings-form"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const name = String(data.get("name") ?? "")
              .trim()
              .slice(0, 40);
            const goal = Number(data.get("goal"));
            update((s) => ({
              ...s,
              name,
              dailyGoal: [3, 6, 9].includes(goal) ? goal : 6,
            }));
            setSettings(false);
            setNotice("Your preferences are saved on this device.");
          }}
        >
          <label>
            Your first name
            <input
              name="name"
              defaultValue={state.name}
              maxLength={40}
              placeholder="What should we call you?"
              autoComplete="given-name"
            />
          </label>
          <label>
            Your daily question goal
            <select name="goal" defaultValue={state.dailyGoal}>
              <option value="3">3 questions · A small start</option>
              <option value="6">6 questions · A steady habit</option>
              <option value="9">9 questions · A little extra</option>
            </select>
          </label>
          <p>
            <ShieldCheck size={15} /> Your name and progress are saved in this
            browser.
          </p>
          <Button type="submit">
            Save my preferences <Check size={16} />
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={help}
        onOpenChange={setHelp}
        title="Your little companion for the big journey."
        description="A free space to practise, reflect, and grow."
      >
        <div className="help-content">
          <div>
            <span>
              <BookOpen size={21} />
            </span>
            <section>
              <h3>Practise with purpose</h3>
              <p>
                Choose a topic or try a daily mix. Check your understanding with
                an explanation and a source for every question.
              </p>
            </section>
          </div>
          <div>
            <span>
              <RotateCcw size={21} />
            </span>
            <section>
              <h3>Come back to what matters</h3>
              <p>
                Mistakes and unsure answers join your revision queue. Confident
                correct answers gradually move reviews further apart.
              </p>
            </section>
          </div>
          <div>
            <span>
              <Leaf size={21} />
            </span>
            <section>
              <h3>Make progress at your pace</h3>
              <p>
                Set a small daily goal and follow your own progress. Your
                learning history is saved on this device.
              </p>
            </section>
          </div>
          <div className="preview-note">
            <strong>About this preview</strong>
            <p>
              This collection contains 9 original sample questions informed by
              OpenStax Anatomy and Physiology 2e. These are not official NORCET
              questions or NPrep faculty-reviewed content. NPrep accounts and
              the full content library are not connected yet.
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="https://nprep.in/" target="_blank" rel="noreferrer">
              Explore NPrep <ArrowUpRight size={16} />
            </a>
          </Button>
        </div>
      </Dialog>
      <Dialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title="Start a fresh session?"
        description="You have a practice session in progress. Answers you have already checked will stay in your learning history."
      >
        <div className="confirm-actions">
          <Button
            variant="outline"
            onClick={() => {
              setPending(null);
              setQuizOpen(true);
            }}
          >
            Continue existing session
          </Button>
          <Button
            onClick={() => {
              if (pending) begin(pending.ids, pending.label);
              setPending(null);
            }}
          >
            Start new session <ArrowRight size={16} />
          </Button>
        </div>
      </Dialog>
    </MotionConfig>
  );
}
