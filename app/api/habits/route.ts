import { prisma } from "@/lib/prisma";

// GET: Fetch all habits
export async function GET() {
  try {
    const habits = await prisma.habit.findMany();
    return Response.json(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    return new Response("Failed to fetch habits", { status: 500 });
  }
}

// POST: Create a new habit
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const habit = await prisma.habit.create({
      data: {
        name: data.name,
        userId: data.userId,
      },
    });
    return Response.json(habit);
  } catch (error) {
    console.error("Error creating habit:", error);
    return new Response("Failed to create habit", { status: 500 });
  }
}
