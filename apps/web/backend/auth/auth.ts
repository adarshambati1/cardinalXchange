import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@cardinalxchange/db";

const STANFORD_DOMAIN = "stanford.edu";

function isStanfordEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at === -1) return false;
  return email.slice(at + 1).toLowerCase() === STANFORD_DOMAIN;
}

export const auth = betterAuth({
  appName: "CardinalXchange",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: false },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (!isStanfordEmail(email)) {
          throw new Error(
            "Magic-link sign-in is restricted to stanford.edu addresses.",
          );
        }
        // Dev: log the link so it can be copied from the server console.
        // Prod: a real SMTP transport (Mailtrap / Postmark / SES) plugs in here.
        if (process.env.NODE_ENV !== "production") {
          console.log(`[auth] Magic link for ${email}: ${url}`);
          return;
        }
        throw new Error(
          "No email transport configured. Set EMAIL_SERVER_* and wire a transport in apps/web/backend/auth/auth.ts.",
        );
      },
    }),
    nextCookies(),
  ],
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"],
});
