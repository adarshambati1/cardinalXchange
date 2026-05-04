import { ChatShell } from "@/features/cxc-ai";
import { getAiChatSnapshot } from "@/server/cxc-ai/services/chat.service";

type CxcAiChatPageProps = {
  params: Promise<{ chatId: string }>;
};

export default async function CxcAiChatPage({ params }: CxcAiChatPageProps) {
  const { chatId } = await params;
  const snapshot = await getAiChatSnapshot(chatId);

  return (
    <ChatShell chatId={chatId} initialMessages={snapshot.messages} />
  );
}
