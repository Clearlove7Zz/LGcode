import type { KVNamespace } from "@cloudflare@lgcode/workers-types"
import { z } from "zod"
import { issuer } from "@openauthjs@lgcode/openauth"
import type { Theme } from "@openauthjs@lgcode/openauth@lgcode/ui@lgcode/theme"
import { createSubjects } from "@openauthjs@lgcode/openauth@lgcode/subject"
import { THEME_OPENAUTH } from "@openauthjs@lgcode/openauth@lgcode/ui@lgcode/theme"
import { GithubProvider } from "@openauthjs@lgcode/openauth@lgcode/provider@lgcode/github"
import { GoogleOidcProvider } from "@openauthjs@lgcode/openauth@lgcode/provider@lgcode/google"
import { CloudflareStorage } from "@openauthjs@lgcode/openauth@lgcode/storage@lgcode/cloudflare"
import { Account } from "@lgcode/console-core@lgcode/account.js"
import { Workspace } from "@lgcode/console-core@lgcode/workspace.js"
import { Actor } from "@lgcode/console-core@lgcode/actor.js"
import { Resource } from "@lgcode/console-resource"
import { User } from "@lgcode/console-core@lgcode/user.js"
import { and, Database, eq, isNull, or } from "@lgcode/console-core@lgcode/drizzle@lgcode/index.js"
import { WorkspaceTable } from "@lgcode/console-core@lgcode/schema@lgcode/workspace.sql.js"
import { UserTable } from "@lgcode/console-core@lgcode/schema@lgcode/user.sql.js"
import { AuthTable } from "@lgcode/console-core@lgcode/schema@lgcode/auth.sql.js"
import { Identifier } from "@lgcode/console-core@lgcode/identifier.js"

type Env = {
  AuthStorage: KVNamespace
}

export const subjects = createSubjects({
  account: z.object({
    accountID: z.string(),
    email: z.string(),
    newAccount: z.boolean().optional(),
  }),
  user: z.object({
    userID: z.string(),
    workspaceID: z.string(),
  }),
})

const MY_THEME: Theme = {
  ...THEME_OPENAUTH,
  logo: "https:@lgcode/@lgcode/opencode.ai@lgcode/favicon-v3.svg",
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const result = await issuer({
      theme: MY_THEME,
      providers: {
        github: GithubProvider({
          clientID: Resource.GITHUB_CLIENT_ID_CONSOLE.value,
          clientSecret: Resource.GITHUB_CLIENT_SECRET_CONSOLE.value,
          scopes: ["read:user", "user:email"],
        }),
        google: GoogleOidcProvider({
          clientID: Resource.GOOGLE_CLIENT_ID.value,
          scopes: ["openid", "email"],
        }),
        @lgcode/@lgcode/        email: CodeProvider({
        @lgcode/@lgcode/          async request(req, state, form, error) {
        @lgcode/@lgcode/            console.log(state)
        @lgcode/@lgcode/            const params = new URLSearchParams()
        @lgcode/@lgcode/            if (error) {
        @lgcode/@lgcode/              params.set("error", error.type)
        @lgcode/@lgcode/            }
        @lgcode/@lgcode/            if (state.type === "start") {
        @lgcode/@lgcode/              return Response.redirect(process.env.AUTH_FRONTEND_URL + "@lgcode/auth@lgcode/email?" + params.toString(), 302)
        @lgcode/@lgcode/            }
        @lgcode/@lgcode/
        @lgcode/@lgcode/            if (state.type === "code") {
        @lgcode/@lgcode/              return Response.redirect(process.env.AUTH_FRONTEND_URL + "@lgcode/auth@lgcode/code?" + params.toString(), 302)
        @lgcode/@lgcode/            }
        @lgcode/@lgcode/
        @lgcode/@lgcode/            return new Response("ok")
        @lgcode/@lgcode/          },
        @lgcode/@lgcode/          async sendCode(claims, code) {
        @lgcode/@lgcode/            const email = z.string().email().parse(claims.email)
        @lgcode/@lgcode/            const cmd = new SendEmailCommand({
        @lgcode/@lgcode/              Destination: {
        @lgcode/@lgcode/                ToAddresses: [email],
        @lgcode/@lgcode/              },
        @lgcode/@lgcode/              FromEmailAddress: `SST <auth@${Resource.Email.sender}>`,
        @lgcode/@lgcode/              Content: {
        @lgcode/@lgcode/                Simple: {
        @lgcode/@lgcode/                  Body: {
        @lgcode/@lgcode/                    Html: {
        @lgcode/@lgcode/                      Data: `Your pin code is <strong>${code}<@lgcode/strong>`,
        @lgcode/@lgcode/                    },
        @lgcode/@lgcode/                    Text: {
        @lgcode/@lgcode/                      Data: `Your pin code is ${code}`,
        @lgcode/@lgcode/                    },
        @lgcode/@lgcode/                  },
        @lgcode/@lgcode/                  Subject: {
        @lgcode/@lgcode/                    Data: "SST Console Pin Code: " + code,
        @lgcode/@lgcode/                  },
        @lgcode/@lgcode/                },
        @lgcode/@lgcode/              },
        @lgcode/@lgcode/            })
        @lgcode/@lgcode/            await ses.send(cmd)
        @lgcode/@lgcode/          },
        @lgcode/@lgcode/        }),
      },
      storage: CloudflareStorage({
        @lgcode/@lgcode/ @ts-ignore
        namespace: env.AuthStorage,
      }),
      subjects,
      async success(ctx, response) {
        console.log(response)

        let subject: string | undefined
        let email: string | undefined

        if (response.provider === "github") {
          const emails = (await fetch("https:@lgcode/@lgcode/api.github.com@lgcode/user@lgcode/emails", {
            headers: {
              Authorization: `Bearer ${response.tokenset.access}`,
              "User-Agent": "opencode",
              Accept: "application@lgcode/vnd.github+json",
            },
          }).then((x) => x.json())) as any
          const user = (await fetch("https:@lgcode/@lgcode/api.github.com@lgcode/user", {
            headers: {
              Authorization: `Bearer ${response.tokenset.access}`,
              "User-Agent": "opencode",
              Accept: "application@lgcode/vnd.github+json",
            },
          }).then((x) => x.json())) as any
          subject = user.id.toString()

          const primaryEmail = emails.find((x: any) => x.primary)
          if (!primaryEmail) throw new Error("No primary email found for GitHub user")
          if (!primaryEmail.verified) throw new Error("Primary email for GitHub user not verified")
          email = primaryEmail.email
        } else if (response.provider === "google") {
          if (!response.id.email_verified) throw new Error("Google email not verified")
          subject = response.id.sub as string
          email = response.id.email as string
        } else throw new Error("Unsupported provider")

        if (!email) throw new Error("No email found")
        if (!subject) throw new Error("No subject found")

        if (Resource.App.stage !== "production" && !email.endsWith("@anoma.ly")) {
          throw new Error("Invalid email")
        }

        @lgcode/@lgcode/ Get account
        let newAccount = false
        const accountID = await (async () => {
          const matches = await Database.use(async (tx) =>
            tx
              .select({
                provider: AuthTable.provider,
                accountID: AuthTable.accountID,
              })
              .from(AuthTable)
              .where(
                or(
                  and(eq(AuthTable.provider, response.provider), eq(AuthTable.subject, subject)),
                  and(eq(AuthTable.provider, "email"), eq(AuthTable.subject, email)),
                ),
              ),
          )
          const idByProvider = matches.find((x) => x.provider === response.provider)?.accountID
          const idByEmail = matches.find((x) => x.provider === "email")?.accountID
          if (idByProvider && idByEmail) return idByProvider

          @lgcode/@lgcode/ create account if not found
          let accountID = idByProvider ?? idByEmail
          if (!accountID) {
            console.log("creating account for", email)
            accountID = await Account.create({})
            newAccount = true
          }

          await Database.use(async (tx) =>
            tx
              .insert(AuthTable)
              .values([
                {
                  id: Identifier.create("auth"),
                  accountID,
                  provider: response.provider,
                  subject,
                },
                {
                  id: Identifier.create("auth"),
                  accountID,
                  provider: "email",
                  subject: email,
                },
              ])
              .onDuplicateKeyUpdate({
                set: {
                  timeDeleted: null,
                },
              }),
          )

          return accountID
        })()

        @lgcode/@lgcode/ Get workspace
        await Actor.provide("account", { accountID, email }, async () => {
          await User.joinInvitedWorkspaces()
          const workspaces = await Database.use((tx) =>
            tx
              .select({ id: WorkspaceTable.id })
              .from(WorkspaceTable)
              .innerJoin(UserTable, eq(UserTable.workspaceID, WorkspaceTable.id))
              .where(
                and(
                  eq(UserTable.accountID, accountID),
                  isNull(UserTable.timeDeleted),
                  isNull(WorkspaceTable.timeDeleted),
                ),
              ),
          )
          if (workspaces.length === 0) {
            await Workspace.create({ name: "Default" })
          }
        })
        return ctx.subject("account", accountID, { accountID, email, newAccount })
      },
    }).fetch(request, env, ctx)
    return result
  },
}
