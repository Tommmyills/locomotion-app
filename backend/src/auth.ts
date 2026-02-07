import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "./prisma";
import { env } from "./env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BACKEND_URL,

  // REQUIRED: All trustedOrigins below are needed
  trustedOrigins: [
    "vibecode://*/*", // Mobile deep links
    "exp://*/*", // Expo development
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://*.dev.vibecode.run",
    "https://*.vibecode.run",
    "https://*.vibecodeapp.com",
    "https://*.vercel.app", // Vercel deployments
    "https://locomotion-app.vercel.app",
    env.BACKEND_URL, // Backend's own URL
  ],

  plugins: [
    expo(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Only send OTPs for sign-in
        if (type !== "sign-in") return;

        // Send OTP via Vibecode SMTP service
        const response = await fetch("https://smtp.vibecodeapp.com/v1/send/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            code: String(otp),
            fromName: "LOCO•MOTION",
            lang: "en",
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error || `Failed to send OTP (HTTP ${response.status})`);
        }
      },
    }),
  ],

  // REQUIRED: Cross-origin cookie settings
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    disableCSRFCheck: true,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true,
    },
  },
});
