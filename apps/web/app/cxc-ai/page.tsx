import { redirect } from "next/navigation";

import { createAiChatSession } from "@/server/cxc-ai/services/chat.service";

export const dynamic = "force-dynamic";

export default async function CxcAiIndexPage() {
  const session = await createAiChatSession();
  redirect(`/cxc-ai/${session.id}`);
}
