import { Auth } from "@auth/core";
import EmailProvider from "@auth/core/providers/email";
import Google from "@auth/core/providers/google";
import { eventHandler, toWebRequest } from "h3";

export default eventHandler(async (event) =>
  Auth(toWebRequest(event), {
    secret: process.env.AUTH_SECRET,
    trustHost: !!process.env.VERCEL,
    redirectProxyUrl: process.env.AUTH_REDIRECT_PROXY_URL,
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: { scope: "openid email profile User.Read  offline_access" },
        },
      }),
      EmailProvider({
        maxAge: 2 * 60 * 60, // How long email links are valid for (default 2 hours),
      }),
    ],
  }),
);
