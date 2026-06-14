"use client";
import "./styles/arrival.css";




import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ArrivalPage() {
  const [selectedAvatar, setSelectedAvatar] = useState<"fox" | "owl" | null>(null);
  const router = useRouter();

  function handleContinue() {
    if (!selectedAvatar) {
      alert("Please select an avatar first!");
      return;
    }

    // Save avatar
    localStorage.setItem("habitQuestAvatar", selectedAvatar);

    router.push("/dashboard"); // ✅ make sure app/dashboard/page.tsx exists
  }

  return (
    <div
      className={`arcade-container arrival-container min-h-screen bg-cover bg-center transition-all duration-700 ${
        selectedAvatar === "fox"
          ? "bg-[url('/light-backdrop.jpg')]"
          : "bg-[url('/dark-backdrop.jpg')]"
      }`}
    >
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-white text-3xl font-pixel mb-8 arcade-heading glow-heading">Welcome to EduQuest Arcade!</h1>
        <p className="text-white text-lg font-pixel mb-10">
          Choose your avatar to begin the retro learning adventure.
        </p>

        <div className="avatar-grid">
          {/* 🦊 Fox Avatar */}
          <div
            onClick={() => setSelectedAvatar("fox")}
            className={`avatar-option cursor-pointer transition-transform duration-300 ${
              selectedAvatar === "fox" ? "selected scale-105" : "opacity-80"
            }`}
          >
            <img src="/fox.png" alt="Fox Avatar" className="w-40 h-40 mx-auto" />
            <p className="text-orange-400 font-pixel mt-2">Fox</p>
            <p className="text-gray-300 text-sm font-pixel">
              Bright mornings, energetic focus
            </p>
          </div>

          {/* 🦉 Owl Avatar */}
          <div
            onClick={() => setSelectedAvatar("owl")}
            className={`avatar-option cursor-pointer transition-transform duration-300 ${
              selectedAvatar === "owl" ? "selected scale-105" : "opacity-80"
            }`}
          >
            <img src="/owl.png" alt="Owl Avatar" className="w-40 h-40 mx-auto" />
            <p className="text-purple-400 font-pixel mt-2">Owl</p>
            <p className="text-gray-300 text-sm font-pixel">
              Calm nights, focused clarity
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedAvatar}
          className={`continue-btn ${!selectedAvatar ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
