"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HabitsPage() {
  const router = useRouter();
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [customHabit, setCustomHabit] = useState("");
  const [habits, setHabits] = useState([
    { name: "Exercise", icon: "/dumbbell.png" },
    { name: "Reading", icon: "/book.png" },
    { name: "Drink Water", icon: "/water.png" },
    { name: "Sleep Early", icon: "/bed.png" },
  ]);

  function addHabit() {
    if (customHabit.trim() !== "") {
      setHabits([...habits, { name: customHabit, icon: "/custom.png" }]);
      setCustomHabit("");
    }
  }

  function startTracking() {
    if (selectedHabit) {
      router.push("/dashboard"); // Navigate to dashboard
    } else {
      alert("Please select or add a habit first!");
    }
    if (selectedHabit || habits.length > 0) {
    // Save habits to localStorage
    localStorage.setItem("habitQuestHabits", JSON.stringify(habits));
    router.push("/dashboard");
  } else {
    alert("Please select or add a habit first!");
  }
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-center px-6">
      {/* Header */}
      <h1 className="text-white text-3xl font-pixel mb-8">
        Choose Your First Habit
      </h1>

      {/* Habit Cards */}
      <div className="grid grid-cols-2 gap-6">
        {habits.map((habit, index) => (
          <div
            key={index}
            onClick={() => setSelectedHabit(habit.name)}
            className={`cursor-pointer border-2 border-black rounded-md p-4 flex flex-col items-center transition-transform duration-300 ${
              selectedHabit === habit.name
                ? "bg-green-500 text-white scale-105"
                : "bg-gray-800 text-white opacity-80"
            }`}
          >
            <img src={habit.icon} alt={habit.name} className="w-16 h-16 mb-2" />
            <p className="font-pixel">{habit.name}</p>
          </div>
        ))}
      </div>

      {/* Custom Habit Input */}
      <div className="mt-8 flex gap-4 items-center">
        <input
          type="text"
          value={customHabit}
          onChange={(e) => setCustomHabit(e.target.value)}
          placeholder="Add your own habit..."
          className="px-4 py-2 border-2 border-black font-pixel bg-white text-black rounded-md"
        />
        <button
          onClick={addHabit}
          className="px-4 py-2 bg-blue-500 text-white font-pixel border-2 border-black rounded-md"
        >
          + Add Habit
        </button>
      </div>

      {/* Start Tracking Button */}
      <button
        onClick={startTracking}
        className="mt-12 px-8 py-3 font-pixel border-2 border-black rounded-md transition-transform duration-300 bg-purple-600 text-white hover:translate-y-[-2px]"
      >
        Start Tracking
      </button>
    </div>
  );
}
