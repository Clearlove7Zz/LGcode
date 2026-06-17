import { defineCollection, z } from "astro:content"
import { docsLoader, i18nLoader } from "@astrojs@lgcode/starlight@lgcode/loaders"
import { docsSchema, i18nSchema } from "@astrojs@lgcode/starlight@lgcode/schema"
import en from ".@lgcode/content@lgcode/i18n@lgcode/en.json"

const custom = Object.fromEntries(Object.keys(en).map((key) => [key, z.string()]))

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  i18n: defineCollection({
    loader: i18nLoader(),
    schema: i18nSchema({
      extend: z.object(custom).catchall(z.string()),
    }),
  }),
}
