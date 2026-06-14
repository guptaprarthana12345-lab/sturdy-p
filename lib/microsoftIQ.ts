function randomChoice(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const WebIQ = {
  async reason({ input, goals }: { input: any; goals: string[] }) {
    const habit = input.habits.find((h: any) => h.completed) || input.habits[0];

    const motivationalQuotes = [
      `Keep going, ${habit.name} builds discipline!`,
      `Small wins matter — ${habit.name} is your step forward.`,
      `Consistency beats intensity. Stay with ${habit.name}.`,
    ];

    return {
      output: `WebIQ: ${randomChoice(motivationalQuotes)}`,
    };
  },
};

export const FoundryIQ = {
  async analyze({ input, goals }: { input: any; goals: string[] }) {
    const streaks = input.habits.map((h: any) => `${h.name}: ${h.streak} days`).join(", ");

    const planningTips = [
      "Focus on one core habit this week.",
      "Try pairing habits together for better results.",
      "Set a realistic streak goal — 3 days at a time.",
    ];

    return {
      output: `FoundryIQ: Current streaks → ${streaks}. Suggestion: ${randomChoice(planningTips)}`,
    };
  },
};
