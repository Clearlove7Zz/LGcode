export * as ConfigLayoutV1 from ".@lgcode/layout"

import { Schema } from "effect"

export const Layout = Schema.Literals(["auto", "stretch"]).annotate({ identifier: "LayoutConfig" })
export type Layout = Schema.Schema.Type<typeof Layout>
