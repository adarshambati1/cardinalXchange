"use client";

import { useMemo, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Bot, Loader2, MessageSquarePlus, Square, User } from "lucide-react";

type CxcAiChatProps = {
  chatId: string;
  initialMessages: UIMessage[];
};

export function CxcAiChat({ chatId, initialMessages }: CxcAiChatProps) {
  const [input, setInput] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/cxc-ai",
        prepareSendMessagesRequest({ id, messages }) {
          return {
            body: {
              id,
              messages,
            },
          };
        },
      }),
    [],
  );
  const { error, messages, regenerate, sendMessage, status, stop } = useChat({
    id: chatId,
    messages: initialMessages,
    transport,
    onFinish: ({ messages: finishedMessages }) => {
      void fetch(`/api/cxc-ai/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: finishedMessages }),
      });
    },
  });
  const isBusy = status === "submitted" || status === "streaming";

  return (
    <main className="min-h-screen bg-paper text-graphite-950">
      <header className="border-b border-graphite-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <a className="text-sm font-bold text-cardinal-700" href="/">
              CardinalXchange
            </a>
            <h1 className="mt-1 truncate text-xl font-black">CXC AI</h1>
          </div>
          <a
            className="inline-flex h-10 items-center gap-2 rounded-md border border-graphite-200 bg-white px-3 text-sm font-bold text-graphite-800 transition hover:bg-graphite-50"
            href="/cxc-ai"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New chat
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        <section className="flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-lg border border-graphite-200 bg-white">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              messages.map((message) => <ChatMessage key={message.id} message={message} />)
            )}
            {error ? (
              <div className="rounded-md border border-cardinal-200 bg-cardinal-50 px-3 py-2 text-sm font-semibold text-cardinal-900">
                CXC AI could not finish that response.
                <button className="ml-2 underline" onClick={() => regenerate()} type="button">
                  Retry
                </button>
              </div>
            ) : null}
          </div>

          <form
            className="border-t border-graphite-200 bg-graphite-50 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!input.trim() || isBusy) {
                return;
              }
              void sendMessage({ text: input.trim() });
              setInput("");
            }}
          >
            <div className="flex items-end gap-2 rounded-lg border border-graphite-200 bg-white p-2 focus-within:border-cardinal-300">
              <textarea
                className="max-h-40 min-h-12 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-graphite-400"
                disabled={isBusy}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask from public CardinalXchange questions and answers..."
                rows={2}
                value={input}
              />
              {isBusy ? (
                <button
                  aria-label="Stop response"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-graphite-900 text-white"
                  onClick={() => stop()}
                  type="button"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              ) : (
                <button
                  aria-label="Send message"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cardinal-700 text-white disabled:opacity-50"
                  disabled={!input.trim()}
                  type="submit"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[24rem] items-center justify-center">
      <div className="max-w-xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-cardinal-50 text-cardinal-700">
          <Bot className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-black">Ask CXC AI</h2>
        <p className="mt-3 text-sm leading-6 text-graphite-600">
          Answers are grounded in public CardinalXchange questions and answers. When context is
          thin, CXC AI can draft an Ask the Community post without submitting it.
        </p>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <article className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cardinal-50 text-cardinal-700">
          <Bot className="h-4 w-4" />
        </div>
      ) : null}
      <div
        className={`max-w-[min(42rem,85%)] rounded-lg px-4 py-3 text-sm leading-6 ${
          isUser ? "bg-cardinal-700 text-white" : "border border-graphite-200 bg-white"
        }`}
      >
        <div className="space-y-3">
          {message.parts.map((part, index) => (
            <MessagePart key={`${message.id}-${index}`} part={part} />
          ))}
          {message.parts.length === 0 && message.role === "assistant" ? (
            <span className="inline-flex items-center gap-2 text-graphite-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking
            </span>
          ) : null}
        </div>
      </div>
      {isUser ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-graphite-100 text-graphite-700">
          <User className="h-4 w-4" />
        </div>
      ) : null}
    </article>
  );
}

function MessagePart({ part }: { part: UIMessage["parts"][number] }) {
  if (part.type === "text") {
    return <p className="whitespace-pre-wrap">{part.text}</p>;
  }

  if (part.type.startsWith("tool-")) {
    return (
      <div className="rounded-md border border-graphite-200 bg-graphite-50 px-3 py-2 text-xs font-semibold text-graphite-600">
        {part.type.replace("tool-", "Tool: ")}
      </div>
    );
  }

  if (part.type.startsWith("source-")) {
    const source = part as { title?: string; url?: string };
    return (
      <a
        className="block rounded-md border border-gold-200 bg-gold-50 px-3 py-2 text-xs font-bold text-gold-800"
        href={source.url ?? "#"}
      >
        {source.title ?? "Source"}
      </a>
    );
  }

  return null;
}
