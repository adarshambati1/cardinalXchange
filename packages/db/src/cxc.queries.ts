import { prisma } from "./client";
import { aiChatSessionInclude, type AiChatSessionRecord } from "./types";

export async function createAiChatSessionRecord(
  title = "New CXC AI chat",
): Promise<AiChatSessionRecord> {
  return prisma.aiChatSession.create({
    data: {
      title,
    },
    include: aiChatSessionInclude,
  });
}

export async function getAiChatSessionRecord(
  chatId: string,
): Promise<AiChatSessionRecord | null> {
  return prisma.aiChatSession.findUnique({
    where: {
      id: chatId,
    },
    include: aiChatSessionInclude,
  });
}

export async function listAiChatSessionRecords(): Promise<AiChatSessionRecord[]> {
  return prisma.aiChatSession.findMany({
    include: aiChatSessionInclude,
    orderBy: {
      updatedAt: "desc",
    },
  });
}
