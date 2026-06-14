"use client";

import "../styles/dashboard.css";
import { useEffect, useMemo, useRef, useState } from "react";

type Habit = { name: string; completed: boolean; streak: number; history: number[] };
type Goal = { name: string; completed: boolean };
type CompanionType = "fox" | "owl";
type CompanionMessage = { id: string; from: "bot" | "user"; text: string; timestamp: string };
type ChatTab = "companion" | "decision";
type DecisionResult = {
  recommended: string;
  confidence: number;
  reasoning: string[];
  downside: string;
};

const companionProfiles: Record<CompanionType, {
  label: string;
  title: string;
  sprite: string;
  energy: string;
  style: string;
  bestFor: string[];
  onboardMessage: string;
  personality: string;
}> = {
  fox: {
    label: "Fox",
    title: "🦊 FOX",
    sprite: "/fox.png",
    energy: "High",
    style: "Action-oriented",
    bestFor: ["Fitness", "Building momentum", "Morning routines"],
    onboardMessage: "Let's move fast and conquer your goals.",
    personality: "Quick, brave, and eager to turn ideas into action.",
  },
  owl: {
    label: "Owl",
    title: "🦉 OWL",
    sprite: "/owl.png",
    energy: "Calm",
    style: "Strategic",
    bestFor: ["Studying", "Deep work", "Long-term habits"],
    onboardMessage: "Every great achievement starts with one wise step.",
    personality: "Thoughtful, steady, and tuned to long-term success.",
  },
};

const quickActions = [
  { label: "Ask for motivation", prompt: "Give me a boost for my day." },
  { label: "Suggest habit", prompt: "Recommend a habit I can start now." },
  { label: "Daily challenge", prompt: "What challenge should I try today?" },
  { label: "Study tip", prompt: "Share a quick study tip." },
  { label: "Productivity advice", prompt: "How can I stay productive?" },
  { label: "Fun fact", prompt: "Tell me a fun fact." },
];

const navItems = [
  { id: "habits", icon: "📋", label: "Habits" },
  { id: "stats", icon: "📊", label: "Stats" },
  { id: "rewards", icon: "🎁", label: "Rewards" },
  { id: "goals", icon: "🎯", label: "Goals" },
] as const;

function nowTimestamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function createMessage(from: "bot" | "user", text: string): CompanionMessage {
  return { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, from, text, timestamp: nowTimestamp() };
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"habits" | "stats" | "rewards" | "goals">("habits");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionType>("owl");
  const [companionStage, setCompanionStage] = useState<"onboard" | "ready">("onboard");
  const [chatTab, setChatTab] = useState<ChatTab>("companion");
  const [chatMessages, setChatMessages] = useState<CompanionMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [statsRange, setStatsRange] = useState<"weekly" | "monthly">("weekly");
  const [typing, setTyping] = useState(false);
  const [decisionQuestion, setDecisionQuestion] = useState("");
  const [decisionOptions, setDecisionOptions] = useState(["", ""]);
  const [decisionStatus, setDecisionStatus] = useState<"idle" | "thinking" | "done">("idle");
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(null);
  const [currentQuest, setCurrentQuest] = useState("Complete your first daily quest");
  const [friendship, setFriendship] = useState(78);
  const hasInitialized = useRef(false);

  const companionProfile = companionProfiles[selectedCompanion];
  const levelXp = level * 100;
  const xpProgress = Math.max(0, Math.min(100, Math.round((xp / levelXp) * 100)));
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const streakProgress = habits.length ? Math.max(0, Math.min(100, Math.round((totalStreak / Math.max(1, habits.length * 5)) * 100))) : 0;
  const friendshipProgress = Math.min(100, friendship);

  const weeklyStatus = useMemo(
    () => Array.from({ length: 7 }, (_, i) => habits.flatMap(h => h.history)[habits.flatMap(h => h.history).length - 7 + i] ?? 0),
    [habits]
  );
  const monthlyStatus = useMemo(
    () => Array.from({ length: 30 }, (_, i) => habits.flatMap(h => h.history)[habits.flatMap(h => h.history).length - 30 + i] ?? 0),
    [habits]
  );

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const savedData = localStorage.getItem("habitQuestData");
    const savedHabits = localStorage.getItem("habitQuestHabits");
    const savedGoals = localStorage.getItem("habitQuestGoals");
    const savedAvatar = localStorage.getItem("habitQuestAvatar") as CompanionType | null;
    const savedMessages = localStorage.getItem("habitQuestChatMessages");
    const savedQuest = localStorage.getItem("habitQuestCurrentQuest");
    const savedFriendship = localStorage.getItem("habitQuestFriendship");

    if (savedData) {
      const parsed = JSON.parse(savedData);
      setXp(parsed.xp || 0);
      setLevel(parsed.level || 1);
      setUnlockedRewards(parsed.unlockedRewards || []);
    }

    if (savedHabits) {
      try {
        const parsed = JSON.parse(savedHabits);
        setHabits(parsed.map((h: any) => ({ name: String(h.name ?? h), completed: false, streak: 0, history: [] })));
      } catch (err) {
        console.error("Error parsing saved habits:", err);
      }
    }

    if (savedGoals) {
      try {
        const parsed = JSON.parse(savedGoals);
        setGoals(parsed.map((g: any) => ({ name: String(g.name ?? g), completed: Boolean(g.completed) })));
      } catch (err) {
        console.error("Error parsing saved goals:", err);
      }
    }

    if (savedAvatar === "fox" || savedAvatar === "owl") {
      setSelectedCompanion(savedAvatar);
    }

    if (savedQuest) setCurrentQuest(savedQuest);
    if (savedFriendship) setFriendship(Number(savedFriendship));

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages) as CompanionMessage[];
        setChatMessages(parsed);
        if (parsed.length > 0) setCompanionStage("ready");
      } catch {
        setChatMessages([]);
      }
    } else {
      setChatMessages([createMessage("bot", `${companionProfile.onboardMessage} Before we begin, tell me one habit you want to improve.`)]);
    }

    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("habitQuestDate");
    if (lastDate !== today) {
      setHabits(prev => prev.map(h => ({ ...h, completed: false })));
      localStorage.setItem("habitQuestDate", today);
    }
  }, [companionProfile.onboardMessage]);

  useEffect(() => {
    localStorage.setItem("habitQuestData", JSON.stringify({ habits, goals, xp, level, unlockedRewards }));
    localStorage.setItem("habitQuestHabits", JSON.stringify(habits.map(h => h.name)));
    localStorage.setItem("habitQuestGoals", JSON.stringify(goals));
    localStorage.setItem("habitQuestAvatar", selectedCompanion);
    localStorage.setItem("habitQuestChatMessages", JSON.stringify(chatMessages));
    localStorage.setItem("habitQuestCurrentQuest", currentQuest);
    localStorage.setItem("habitQuestFriendship", friendship.toString());
  }, [habits, goals, xp, level, unlockedRewards, selectedCompanion, chatMessages, currentQuest, friendship]);

  function addGoal() {
    const trimmed = newGoal.trim();
    if (!trimmed) return;
    setGoals(prev => [...prev, { name: trimmed, completed: false }]);
    setNewGoal("");
    enqueueCompanionMessage(`A new goal is set: ${trimmed}. I’ll cheer you on.`);
  }

  function addHabit() {
    const trimmed = newHabit.trim();
    if (!trimmed) return;
    setHabits(prev => [...prev, { name: trimmed, completed: false, streak: 0, history: [] }]);
    setNewHabit("");
    enqueueCompanionMessage(`Nice, ${trimmed} is now part of your quest log.`);
  }

  function unlockReward(newLevel: number) {
    const rewards: Record<number, string> = {
      2: "🎉 Motivational Quote Pack",
      3: "🏆 Custom Avatar Accessory",
      4: "🌟 Special Theme",
      5: "💎 Bonus XP Boost",
    };
    if (rewards[newLevel]) {
      setUnlockedRewards(prev => [...prev, rewards[newLevel]]);
      enqueueCompanionMessage(`Level ${newLevel}! You've unlocked ${rewards[newLevel]}.`);
    }
  }

  function redeemReward(cost: number, name: string) {
    if (xp < cost) {
      enqueueCompanionMessage("Not enough XP to redeem that reward.");
      return;
    }
    setXp(prev => prev - cost);
    setUnlockedRewards(prev => [...prev, name]);
    enqueueCompanionMessage(`Redeemed ${name}! Nice choice.`);
  }

  function toggleHabit(index: number) {
    setHabits(prevHabits => {
      const updated = [...prevHabits];
      const habit = { ...updated[index] };
      habit.completed = !habit.completed;
      if (habit.completed) {
        habit.streak += 1;
        habit.history = [...habit.history, 1];
        const newXp = xp + 10;
        setXp(newXp);
        enqueueCompanionMessage(`Great job on ${habit.name}! +10 XP`);
        if (newXp >= levelXp) {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          unlockReward(nextLevel);
        }
      } else {
        habit.streak = Math.max(0, habit.streak - 1);
        habit.history = [...habit.history, 0];
        setXp(prev => Math.max(0, prev - 10));
        enqueueCompanionMessage(`Oops, ${habit.name} streak dipped. Let's recover it tomorrow.`);
      }
      updated[index] = habit;
      return updated;
    });
  }

  function completeGoal(index: number) {
    const goalLabel = goals[index]?.name || "Goal";
    setGoals(prev => {
      const updated = [...prev];
      if (updated[index]?.completed) return updated;
      updated[index] = { ...updated[index], completed: true };
      return updated;
    });
    setXp(prevXp => prevXp + 30);
    enqueueCompanionMessage(`Goal "${goalLabel}" achieved. +30 XP`);
  }

  function enqueueCompanionMessage(text: string, delay = 340) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setChatMessages(prev => [...prev, createMessage("bot", text)]);
    }, delay);
  }

  function handleCompanionResponse(userText: string) {
    const normalized = userText.toLowerCase();
    if (companionStage === "onboard") {
      const habitName = userText.trim() || "your chosen habit";
      setCurrentQuest(habitName);
      setCompanionStage("ready");
      setFriendship(prev => Math.min(100, prev + 8));
      enqueueCompanionMessage(`Got it. We'll shape ${habitName} into a strong daily quest. Ready when you are.`);
      return;
    }

    if (normalized.includes("challenge")) {
      const challenge = selectedCompanion === "fox" ? "a 20-minute power sprint" : "a focused 30-minute study session";
      setCurrentQuest(`Try ${challenge}`);
      setFriendship(prev => Math.min(100, prev + 4));
      enqueueCompanionMessage(`Here's a challenge: ${challenge}. I'm with you through it.`);
      return;
    }

    if (normalized.includes("motivat") || normalized.includes("boost")) {
      enqueueCompanionMessage(selectedCompanion === "fox"
        ? "You already have the spark. Take the first step and I'll amplify it."
        : "Calm focus makes the next step feel natural. Begin with one small win.");
      return;
    }

    if (normalized.includes("study") || normalized.includes("focus") || normalized.includes("work")) {
      enqueueCompanionMessage(selectedCompanion === "fox"
        ? "Let's hit a short, intense focus burst. Set a timer and I’ll cheer you on."
        : "A gentle deep work block is perfect now. Keep the rhythm steady.");
      return;
    }

    if (normalized.includes("fun") || normalized.includes("fact")) {
      enqueueCompanionMessage("Did you know that small wins create rocket fuel for your habits? Keep them stacking.");
      return;
    }

    enqueueCompanionMessage(randomItem([
      "I’m listening — tell me more about your day.",
      "That sounds interesting. Want to turn it into a quest?",
      "Great, let's keep your momentum alive.",
    ]));
  }

  function handleChatSubmit() {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages(prev => [...prev, createMessage("user", text)]);
    setChatInput("");
    handleCompanionResponse(text);
  }

  function sendQuickAction(prompt: string) {
    setChatMessages(prev => [...prev, createMessage("user", prompt)]);
    handleCompanionResponse(prompt);
  }

  function parseDecisionOptions(input: string) {
    return input
      .split(/,|\bor\b|\/|\||;/gi)
      .map(option => option.trim())
      .filter(Boolean);
  }

  function buildDecisionResult(options: string[]): DecisionResult {
    const recommended = randomItem(options);
    const confidence = Math.min(98, Math.max(72, Math.round(80 + Math.random() * 12)));
    const reasoning = selectedCompanion === "fox"
      ? [
          "It keeps the momentum moving.",
          "It fits your current energy and encourages experimentation.",
          "Choosing this will create a quick victory.",
        ]
      : [
          "It aligns with consistent progress.",
          "It follows a thoughtful, long-term strategy.",
          "This choice reduces decision fatigue and keeps you steady.",
        ];
    const downside = selectedCompanion === "fox"
      ? "May require a burst of energy now, but it’s worth the payoff."
      : "May feel slower at first, but it builds a stronger rhythm.";

    return { recommended, confidence, reasoning, downside };
  }

  function handleAnalyzeDecision() {
    const filtered = decisionOptions.filter(opt => opt.trim());
    if (!decisionQuestion.trim() || filtered.length < 2) return;
    setDecisionStatus("thinking");
    setDecisionResult(null);
    setTimeout(() => {
      const result = buildDecisionResult(filtered);
      setDecisionResult(result);
      setDecisionStatus("done");
      setChatMessages(prev => [...prev, createMessage("bot", `${companionProfile.label} recommends: ${result.recommended}`)]);
    }, 900);
  }

  function addDecisionOption() {
    setDecisionOptions(prev => [...prev, ""]);
  }

  function updateDecisionOption(index: number, value: string) {
    setDecisionOptions(prev => prev.map((option, i) => (i === index ? value : option)));
  }

  function removeDecisionOption(index: number) {
    setDecisionOptions(prev => prev.filter((_, i) => i !== index));
  }

  const rewardItems = [
    { title: "Full day holiday", cost: 500, description: "Take a break with a full day off" },
    { title: "Movie night", cost: 250, description: "Relax with a movie reward" },
  ];

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">EQ</div>
          <span className="brand-label">EduQuest</span>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-btn ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              aria-label={item.label}
            >
              {item.icon}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">v0.1</div>
      </aside>

      <main className="dashboard-main">
        <section className="dashboard-header card">
          <div>
            <span className="heading-eyebrow">Quest log</span>
            <h1>Habit dashboard</h1>
            <p className="header-copy">A clean productivity HUD for your daily quests, streaks, and rewards.</p>
          </div>
          <div className="header-meta">
            <div className="status-pill">Level {level}</div>
            <div className="status-hearts" aria-label="Lives">
              {Array.from({ length: 3 }).map((_, index) => (
                <span key={index}>❤️</span>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-stats-grid">
          <article className="stat-card card">
            <div className="card-title">
              <span>XP</span>
              <span>🏹</span>
            </div>
            <div className="card-value">{xp}</div>
            <div className="card-meta">{xp}/{levelXp} XP · Level {level}</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${xpProgress}%` }} />
            </div>
          </article>

          <article className="stat-card card">
            <div className="card-title">
              <span>Streak</span>
              <span>🔥</span>
            </div>
            <div className="card-value">{totalStreak}d</div>
            <div className="card-meta">Current streak momentum</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${streakProgress}%` }} />
            </div>
          </article>
        </section>

        <section className="dashboard-panel card">
          <div className="section-head">
            <div>
              <span className="section-tag">YOUR QUESTS</span>
              <h2 className="section-title">
                {activeTab === "habits" ? "Habit manager" : activeTab === "goals" ? "Goals" : activeTab === "stats" ? "Weekly progress" : "Rewards"}
              </h2>
            </div>
            <div className="section-note">Use the sidebar to switch views, or keep grinding in place.</div>
          </div>

          {activeTab === "habits" && (
            <div className="habit-card">
              <div className="habits-form">
                <input
                  type="text"
                  value={newHabit}
                  onChange={e => setNewHabit(e.target.value)}
                  placeholder="Add new habit"
                  className="habit-input"
                />
                <button type="button" className="button-primary" onClick={addHabit}>Add Habit</button>
              </div>

              <div className="habit-list">
                {habits.length === 0 ? (
                  <div className="habit-empty">No quests yet. Create your first habit to begin earning XP and building momentum.</div>
                ) : (
                  habits.map((habit, index) => (
                    <div key={index} className="habit-item">
                      <div className="habit-info">
                        <div className="habit-label">{habit.name}</div>
                        <div className="habit-meta">Streak: {habit.streak} · {habit.completed ? "Completed" : "Pending"}</div>
                      </div>
                      <div className="habit-actions">
                        <label className="habit-toggle">
                          <input type="checkbox" checked={habit.completed} onChange={() => toggleHabit(index)} />
                          <span>{habit.completed ? "Completed" : "Complete"}</span>
                        </label>
                        <button type="button" className="button-secondary" onClick={() => setHabits(prev => prev.filter((_, i) => i !== index))}>Remove</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "goals" && (
            <div className="goals-grid">
              <div className="goals-list">
                {goals.length === 0 ? (
                  <div className="habit-empty">No goals found. Set a short-term reward goal to earn bonus XP.</div>
                ) : (
                  goals.map((goal, index) => (
                    <div key={index} className={`goal-item ${goal.completed ? "goal-complete" : ""}`}>
                      <div>
                        <p className="goal-name">{goal.name}</p>
                        <p className="goal-meta">Complete once for +30 XP</p>
                      </div>
                      <div className="goal-actions">
                        <button type="button" className={`button-primary ${goal.completed ? "disabled" : ""}`} onClick={() => completeGoal(index)} disabled={goal.completed}>
                          {goal.completed ? "Completed" : "Complete"}
                        </button>
                        <button type="button" className="button-secondary" onClick={() => setGoals(prev => prev.filter((_, i) => i !== index))}>Remove</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="goal-form">
                <input
                  type="text"
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  placeholder="Create a new reward goal"
                  className="habit-input"
                />
                <button type="button" className="button-primary" onClick={addGoal}>Add Goal</button>
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="stats-slide">
              <div className="stats-toggle">
                <button type="button" className={`button-secondary ${statsRange === "weekly" ? "active" : ""}`} onClick={() => setStatsRange("weekly")}>Weekly</button>
                <button type="button" className={`button-secondary ${statsRange === "monthly" ? "active" : ""}`} onClick={() => setStatsRange("monthly")}>Monthly</button>
              </div>
              <div className="status-grid">
                {(statsRange === "weekly" ? weeklyStatus : monthlyStatus).map((status, index) => (
                  <div key={index} className={`status-pill ${status ? "status-good" : "status-miss"}`}>
                    <span>{status ? "✔" : "✘"}</span>
                    <small>{statsRange === "weekly" ? `Day ${index + 1}` : `${index + 1}`}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "rewards" && (
            <div className="rewards-grid">
              {rewardItems.map((reward, index) => {
                const affordable = xp >= reward.cost;
                return (
                  <div key={index} className={`reward-item ${affordable ? "reward-ready" : "reward-locked"}`}>
                    <div className="reward-label">
                      <h3>{reward.title}</h3>
                      <span>{reward.cost} XP</span>
                    </div>
                    <p className="reward-copy">{reward.description}</p>
                    <button type="button" className={`button-primary ${affordable ? "" : "disabled"}`} onClick={() => redeemReward(reward.cost, reward.title)} disabled={!affordable}>
                      {affordable ? "Redeem" : "Locked"}
                    </button>
                  </div>
                );
              })}

              <div className="unlocked-panel">
                <h3>Unlocked rewards</h3>
                <ul>
                  {unlockedRewards.length ? unlockedRewards.map((reward, index) => <li key={index}>{reward}</li>) : <li>No rewards unlocked yet.</li>}
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>

      <aside className="dashboard-companion">
        <section className="companion-status card">
          <div className="status-top">
            <div className="avatar-badge" aria-label={`${companionProfile.label} companion`}>
              {companionProfile.title}
            </div>
            <div className="status-body">
              <p className="status-label">Companion Status</p>
              <h2>{companionProfile.label}</h2>
              <p className="status-copy">{companionProfile.personality}</p>
            </div>
          </div>

          <div className="status-grid-panel">
            <div className="status-card-small">
              <span>Current Quest</span>
              <strong>{currentQuest}</strong>
            </div>
            <div className="status-card-small">
              <span>Mood</span>
              <strong>{companionStage === "ready" ? "Focused" : "Curious"}</strong>
            </div>
          </div>

          <div className="status-grid-panel">
            <div className="status-card-small">
              <span>Friendship</span>
              <strong>{friendshipProgress}%</strong>
              <div className="mini-progress">
                <div className="mini-progress-fill" style={{ width: `${friendshipProgress}%` }} />
              </div>
            </div>
            <div className="status-card-small">
              <span>Level</span>
              <strong>{level}</strong>
              <div className="mini-progress">
                <div className="mini-progress-fill" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>
        </section>

        <section className="companion-panel card">
          <div className="tab-nav">
            <button
              type="button"
              className={`tab-button ${chatTab === "companion" ? "active" : ""}`}
              onClick={() => setChatTab("companion")}
            >
              Companion Chat
            </button>
            <button
              type="button"
              className={`tab-button ${chatTab === "decision" ? "active" : ""}`}
              onClick={() => setChatTab("decision")}
            >
              Decision Maker
            </button>
          </div>

          {chatTab === "companion" ? (
            <div className="chat-tab">
              <div className="chat-window">
                {chatMessages.map(message => (
                  <div key={message.id} className={`chat-bubble ${message.from}`}>
                    <div className="bubble-top">
                      <span>{message.from === "bot" ? companionProfile.title : "You"}</span>
                      <small>{message.timestamp}</small>
                    </div>
                    <p>{message.text}</p>
                  </div>
                ))}
                {typing && (
                  <div className="typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    {companionProfile.label} is typing...
                  </div>
                )}
              </div>

              <div className="quick-actions">
                {quickActions.map(action => (
                  <button key={action.label} type="button" className="quick-chip" onClick={() => sendQuickAction(action.prompt)}>
                    {action.label}
                  </button>
                ))}
              </div>

              <div className="chat-input-row">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleChatSubmit(); }}
                  placeholder="Type a message"
                  className="chat-input"
                />
                <button type="button" className="button-primary" onClick={handleChatSubmit}>Send</button>
              </div>
            </div>
          ) : (
            <div className="decision-tab">
              <div className="decision-section">
                <label className="decision-label">What are you deciding?</label>
                <input
                  type="text"
                  value={decisionQuestion}
                  onChange={e => setDecisionQuestion(e.target.value)}
                  placeholder="Describe the choice you need help with"
                  className="habit-input"
                />
              </div>

              <div className="option-list">
                {decisionOptions.map((option, index) => (
                  <div key={`${option}-${index}`} className="option-row">
                    <input
                      type="text"
                      value={option}
                      onChange={e => updateDecisionOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="habit-input"
                    />
                    {decisionOptions.length > 2 && (
                      <button type="button" className="button-secondary" onClick={() => removeDecisionOption(index)}>Remove</button>
                    )}
                  </div>
                ))}
                <button type="button" className="button-secondary" onClick={addDecisionOption}>+ Add Option</button>
              </div>

              <div className="decision-footer">
                <button type="button" className="button-primary" onClick={handleAnalyzeDecision} disabled={decisionStatus === "thinking"}>Analyze</button>
                {decisionStatus === "thinking" && <span className="decision-loading">{companionProfile.label} is thinking...</span>}
              </div>

              {decisionResult && (
                <div className="result-card">
                  <div className="result-title">Recommended Choice</div>
                  <strong>{decisionResult.recommended}</strong>
                  <div className="result-meta">Confidence: {decisionResult.confidence}%</div>
                  <div className="result-block">
                    <div className="result-heading">Reasoning</div>
                    <ul>
                      {decisionResult.reasoning.map((line, index) => <li key={index}>{line}</li>)}
                    </ul>
                  </div>
                  <div className="result-block">
                    <div className="result-heading">Potential downside</div>
                    <p>{decisionResult.downside}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
