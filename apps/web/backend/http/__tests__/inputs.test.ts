import { describe, expect, it } from "vitest";

import { HttpError } from "../http";
import { parseCreateAnswerInput, parseCreateQuestionInput } from "../inputs";

describe("parseCreateQuestionInput", () => {
  it("accepts a minimal valid payload and returns trimmed values", () => {
    const result = parseCreateQuestionInput({
      title: "  How do I drop CS 109?  ",
      body: "I need help understanding the schedule.",
    });

    expect(result.title).toBe("How do I drop CS 109?");
    expect(result.body).toBe("I need help understanding the schedule.");
    expect(result.tags).toEqual([]);
    expect(result.authorDisplayName).toBeUndefined();
  });

  it("normalizes a comma-separated tags string into an array", () => {
    const result = parseCreateQuestionInput({
      title: "Recommendations for HCI electives",
      body: "Looking for HCI electives next quarter.",
      tags: "hci, design, electives",
    });

    expect(result.tags).toEqual(["hci", "design", "electives"]);
  });

  it("rejects an empty title with a 400 invalid_question_input HttpError", () => {
    expect(() =>
      parseCreateQuestionInput({
        title: "   ",
        body: "Body is fine.",
      }),
    ).toThrowError(HttpError);

    try {
      parseCreateQuestionInput({ title: "", body: "Body is fine." });
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      const httpError = error as HttpError;
      expect(httpError.status).toBe(400);
      expect(httpError.code).toBe("invalid_question_input");
      expect(httpError.message.toLowerCase()).toContain("title");
    }
  });

  it("rejects a missing body with a 400 invalid_question_input HttpError", () => {
    try {
      parseCreateQuestionInput({ title: "A real title", body: "" });
      throw new Error("expected parseCreateQuestionInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      const httpError = error as HttpError;
      expect(httpError.status).toBe(400);
      expect(httpError.code).toBe("invalid_question_input");
    }
  });
});

describe("parseCreateAnswerInput", () => {
  it("rejects an empty body with a 400 invalid_answer_input HttpError", () => {
    try {
      parseCreateAnswerInput({ body: "   " });
      throw new Error("expected parseCreateAnswerInput to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      const httpError = error as HttpError;
      expect(httpError.status).toBe(400);
      expect(httpError.code).toBe("invalid_answer_input");
    }
  });

  it("accepts a valid body and returns the trimmed value", () => {
    const result = parseCreateAnswerInput({
      body: "  This is a real answer.  ",
    });
    expect(result.body).toBe("This is a real answer.");
  });
});
