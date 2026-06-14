import { NextResponse } from "next/server";
import { WebIQ, FoundryIQ } from "@/lib/microsoftIQ";

export async function POST(req: Request) {
  const context = await req.json();

  const webResponse = await WebIQ.reason({
    input: context,
    goals: ["motivation", "habit coaching"],
  });

  const foundryResponse = await FoundryIQ.analyze({
    input: context,
    goals: ["progress roadmap", "long-term planning"],
  });

  const combinedMessage = `${webResponse.output}\n${foundryResponse.output}`;
  return NextResponse.json({ message: combinedMessage });
}
