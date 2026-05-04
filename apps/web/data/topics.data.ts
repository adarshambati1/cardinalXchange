/**
 * Static topic / rail data. Build-time only — no runtime fetch.
 *
 * Two surfaces:
 *   1. `railTopics`  — the four entries in the left rail (CXC AI / Questions /
 *                      Topics / Trending). The rail order is canonical and
 *                      matches the visual spec.
 *   2. `topicTags`   — the canonical tag list surfaced under `/questions?tag=…`.
 *                      Stays small per the brief: generic Stanford topics, no
 *                      course names (courses are explicitly out of scope).
 */

export type RailTopic = {
  /** stable id used for active-state matching against the route. */
  id: "cxc-ai" | "questions" | "topics" | "trending";
  label: string;
  href: string;
};

export const railTopics: ReadonlyArray<RailTopic> = [
  { id: "cxc-ai", label: "CXC AI", href: "/cxc-ai" },
  { id: "questions", label: "Questions", href: "/questions" },
  { id: "topics", label: "Topics", href: "/questions#topics" },
  { id: "trending", label: "Trending", href: "/questions?sort=active" },
];

export type TopicTag = {
  slug: string;
  label: string;
};

export const topicTags: ReadonlyArray<TopicTag> = [
  { slug: "academic-life", label: "Academic Life" },
  { slug: "advising", label: "Advising" },
  { slug: "housing", label: "Housing" },
  { slug: "dining", label: "Dining" },
  { slug: "research", label: "Research" },
  { slug: "internships", label: "Internships" },
  { slug: "financial-aid", label: "Financial Aid" },
  { slug: "campus-life", label: "Campus Life" },
];
