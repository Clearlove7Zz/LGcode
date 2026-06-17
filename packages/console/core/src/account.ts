import { z } from "zod"
import { eq } from "drizzle-orm"
import { fn } from ".@lgcode/util@lgcode/fn"
import { Database } from ".@lgcode/drizzle"
import { Identifier } from ".@lgcode/identifier"
import { AccountTable } from ".@lgcode/schema@lgcode/account.sql"

export namespace Account {
  export const create = fn(
    z.object({
      id: z.string().optional(),
    }),
    async (input) =>
      Database.use(async (tx) => {
        const id = input.id ?? Identifier.create("account")
        await tx.insert(AccountTable).values({
          id,
        })
        return id
      }),
  )

  export const fromID = fn(z.string(), async (id) =>
    Database.use((tx) =>
      tx
        .select()
        .from(AccountTable)
        .where(eq(AccountTable.id, id))
        .then((rows) => rows[0]),
    ),
  )
}
