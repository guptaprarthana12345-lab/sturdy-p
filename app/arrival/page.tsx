"use client";
import "../styles/arrival.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const companions = {
  fox: {
    label: "Fox",
    title: "🦊 FOX",
    sprite: "/fox.png",
    energy: "High",
    style: "Action-oriented",
    bestFor: ["Fitness", "Building momentum", "Morning routines"],
    message: "Let's move fast and conquer your goals.",
  },
  owl: {
    label: "Owl",
    title: "🦉 OWL",
    sprite: "/owl.png",
    energy: "Calm",
    style: "Strategic",
    bestFor: ["Studying", "Deep work", "Long-term habits"],
    message: "Every great achievement starts with one wise step.",
  },
};

export default function ArrivalPage() {
  const [selectedAvatar, setSelectedAvatar] = useState<"fox" | "owl" | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedAvatar = localStorage.getItem("habitQuestAvatar");
    if (savedAvatar === "fox" || savedAvatar === "owl") {
      setSelectedAvatar(savedAvatar);
    }
  }, []);

  function handleSelect(avatar: "fox" | "owl") {
    setSelectedAvatar(avatar);
  }

  function handleContinue() {
    if (!selectedAvatar) return;
    localStorage.setItem("habitQuestAvatar", selectedAvatar);
    localStorage.setItem("habitQuestOnboardingPrompt", "true");
    router.push("/dashboard");
  }

  const selectedCompanion = selectedAvatar ? companions[selectedAvatar] : null;

  return (
    <div className="arrival-shell">
      <section className="arrival-hero">
        <div className="hero-layer" />
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />

        <div className="hero-copy">
          <span className="eyebrow">Welcome to EduQuest Arcade</span>
          <h1>Choose your lifelong companion.</h1>
          <p>Your companion will guide your habits, celebrate victories, and help make decisions.</p>
        </div>

        <div className="hero-features">
          <div className="feature-pill">Retro RPG + Modern Dashboard</div>
          <div className="feature-pill">Soft glow, floating particles, premium motion</div>
        </div>

        <div className="hero-stars">
          {Array.from({ length: 10 }).map((_, index) => (
            <span key={index} className={`star star-${index + 1}`} />
          ))}
        </div>
      </section>

      <section className="arrival-panel">
        <div className="panel-header">
          <div>
            <span className="panel-eyebrow">Companion selection</span>
            <h2>Who will lead your adventure?</h2>
          </div>
          <p>Select the companion that feels like your trusted teammate.</p>
        </div>

        <div className="companion-card-grid">
          {(Object.keys(companions) as Array<"fox" | "owl">).map((key) => {
            const companion = companions[key];
            return (
              <button
                key={key}
                type="button"
                className={`companion-card ${selectedAvatar === key ? "selected" : ""}`}
                onClick={() => handleSelect(key)}
              >
                <div className="card-top">
                  <div className="avatar-chip">{companion.title}</div>
                  {selectedAvatar === key && <span className="checkmark">✓</span>}
                </div>

                <div className="sprite-frame">
                  <img src={companion.sprite} alt={`${companion.label} companion`} />
                </div>

                <div className="companion-info">
                  <h3>{companion.label}</h3>
                  <p>Quick-witted presence for your daily momentum.</p>
                  <div className="companion-metadata">
                    <span>Energy: {companion.energy}</span>
                    <span>Style: {companion.style}</span>
                  </div>
                  <div className="companion-best">
                    <strong>Best for:</strong>
                    {companion.bestFor.map((item, index) => (
                      <span key={item} className="best-item">
                        {item}
                        {index < companion.bestFor.length - 1 ? " • " : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedCompanion && (
          <div className="companion-message">
            <div className="message-avatar">{selectedCompanion.title}</div>
            <div className="message-text-block">
              <span className="message-label">Companion says</span>
              <p>{selectedCompanion.message}</p>
              <p className="message-prompt">
                "Before we begin, tell me one habit you want to improve."
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          className={`continue-button ${!selectedAvatar ? "disabled" : ""}`}
          onClick={handleContinue}
          disabled={!selectedAvatar}
        >
          Continue
        </button>
      </section>
    </div>
  );
}
