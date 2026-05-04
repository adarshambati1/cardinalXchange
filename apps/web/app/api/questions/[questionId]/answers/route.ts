import { addAnswer, listAnswers } from "@/server/answers/answers.service";
import { jsonError, jsonOk, readPayload } from "@/server/http/http";
import { parseCreateAnswerInput } from "@/server/http/inputs";

type RouteContext = {
  params: Promise<{ questionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { questionId } = await context.params;
    return jsonOk({ answers: await listAnswers(questionId) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { questionId } = await context.params;
    const payload = await readPayload(request);
    const answer = await addAnswer(questionId, parseCreateAnswerInput(payload));
    return jsonOk({ answer }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
