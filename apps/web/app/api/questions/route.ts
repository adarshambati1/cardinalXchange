import { jsonError, jsonOk, readPayload } from "@/server/http/http";
import { parseCreateQuestionInput } from "@/server/http/inputs";
import {
  createQuestion,
  listQuestions,
} from "@/server/questions/questions.service";

export async function GET() {
  try {
    return jsonOk({ questions: await listQuestions() });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await readPayload(request);
    const question = await createQuestion(parseCreateQuestionInput(payload));
    return jsonOk({ question }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
