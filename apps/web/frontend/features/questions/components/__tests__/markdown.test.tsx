import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Markdown } from "../markdown";

afterEach(() => {
  cleanup();
});

describe("Markdown", () => {
  it("renders bold, italic, and inline code as the right tags", () => {
    const { container } = render(
      <Markdown source="**bold** and *italic* and `code`" />,
    );

    const strong = container.querySelector("strong");
    const em = container.querySelector("em");
    const code = container.querySelector("code");

    expect(strong?.textContent).toBe("bold");
    expect(em?.textContent).toBe("italic");
    expect(code?.textContent).toBe("code");
  });

  it("renders a numbered list as an <ol> with one <li> per item", () => {
    const { container } = render(
      <Markdown source={"1. first\n2. second\n3. third"} />,
    );

    const list = container.querySelector("ol");
    expect(list).not.toBeNull();
    const items = list ? Array.from(list.querySelectorAll("li")) : [];
    expect(items.map((node) => node.textContent)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("renders an unordered list as a <ul> with one <li> per item", () => {
    const { container } = render(
      <Markdown source={"- alpha\n- beta\n- gamma"} />,
    );

    const list = container.querySelector("ul");
    expect(list).not.toBeNull();
    const items = list ? Array.from(list.querySelectorAll("li")) : [];
    expect(items.map((node) => node.textContent)).toEqual([
      "alpha",
      "beta",
      "gamma",
    ]);
  });

  it("renders bare http links as anchors with rel and target attrs", () => {
    render(<Markdown source="See https://stanford.edu for details." />);

    const link = screen.getByRole("link", { name: "https://stanford.edu" });
    expect(link.getAttribute("href")).toBe("https://stanford.edu");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  it("renders [text](url) links with the visible text but the actual href", () => {
    render(<Markdown source="[Stanford](https://stanford.edu)" />);

    const link = screen.getByRole("link", { name: "Stanford" });
    expect(link.getAttribute("href")).toBe("https://stanford.edu");
  });
});
