import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { CxcMessageDto } from "@/backend/http/contracts";

import { MessageList } from "../message-list";

afterEach(() => {
  cleanup();
});

function message(
  role: "user" | "assistant",
  parts: Array<Record<string, unknown>>,
  id = "m-1",
): CxcMessageDto {
  return {
    id,
    role,
    parts,
  } as unknown as CxcMessageDto;
}

describe("MessageList", () => {
  it("renders a user message inside an article tagged data-role='user'", () => {
    const { container } = render(
      <MessageList
        messages={[message("user", [{ type: "text", text: "Hello there" }])]}
      />,
    );

    const userArticle = container.querySelector('article[data-role="user"]');
    expect(userArticle).not.toBeNull();
    expect(userArticle?.textContent).toContain("Hello there");
  });

  it("renders an assistant message inside an article tagged data-role='assistant'", () => {
    const { container } = render(
      <MessageList
        messages={[message("assistant", [{ type: "text", text: "Hi back!" }])]}
      />,
    );

    const aiArticle = container.querySelector('article[data-role="assistant"]');
    expect(aiArticle).not.toBeNull();
    expect(aiArticle?.textContent).toContain("Hi back!");
  });
});
