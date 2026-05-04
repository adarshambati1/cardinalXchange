// Server-internal CXC AI types live here. Wire DTOs (AiChatSession,
// AiChatMessage, AiChatSource, AskCommunityDraft, AiChatSnapshot,
// AiChatSourceKind) cross the wire to the client and now live in
// apps/web/server/http/contracts.ts per the Shared Types Policy.
//
// Add internal-only shapes (e.g. retrieval row shape, agent invocation
// context) here when the Backend / AI agents extend the surface.

export {};
