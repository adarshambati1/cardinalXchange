import { jsonError, jsonOk } from "@/server/http/http";
import { getQuestionDetail } from "@/server/questions/questions.service";

type RouteContext = {
  params: Promise<{ questionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { questionId } = await context.params;
    return jsonOk({ question: await getQuestionDetail(questionId) });
  } catch (error) {
    return jsonError(error);
  }
}
