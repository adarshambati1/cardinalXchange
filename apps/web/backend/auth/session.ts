import { headers } from "next/headers";
import { auth } from "./auth";

export type ViewerSession = {
  userId: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
};

export async function getViewerFromSession(): Promise<ViewerSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const user = session.user;
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    image: user.image ?? null,
    emailVerified: Boolean(user.emailVerified),
  };
}

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthRequiredError";
  }
}

export async function requireViewer(): Promise<ViewerSession> {
  const viewer = await getViewerFromSession();
  if (!viewer) {
    throw new AuthRequiredError();
  }
  return viewer;
}
