import { NextResponse } from "next/server";
import { repo } from "@/modules/store";

export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const c = repo.get(params.id);
  return c ? NextResponse.json(c) : NextResponse.json({ error: "Case not found" }, { status: 404 });
}
