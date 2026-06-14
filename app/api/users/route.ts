import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Create a new user
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const user = await prisma.user.create({
      data: {
        name: body.name as string,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// Get all users
export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}
