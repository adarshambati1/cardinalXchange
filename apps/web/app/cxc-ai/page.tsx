import { ChatShell } from "@/features/cxc-ai";
import { createAiChatSession } from "@/server/cxc-ai/services/chat.service";

export const dynamic = "force-dynamic";

export default async function CxcAiIndexPage() {
  // Mint a session id eagerly so streaming has a stable session to attach
  // messages and sources to. The URL replaces to `/cxc-ai/[chatId]` once the
  // first user message is sent (handled inside `ChatShell`).
  const session = await createAiChatSession();

  return <ChatShell chatId={session.id} initialMessages={[]} isNewChat />;
}
