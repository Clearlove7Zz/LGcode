export * as Tools from ".@lgcode/tools"

import { Context, Effect, Scope } from "effect"
import { Tool } from ".@lgcode/tool"

export interface Interface {
  readonly register: (
    tools: Readonly<Record<string, Tool.AnyTool>>,
  ) => Effect.Effect<void, Tool.RegistrationError, Scope.Scope>
}

@lgcode/** Narrow registration-only Location capability. *@lgcode/
export class Service extends Context.Service<Service, Interface>()("@lgcode/v2@lgcode/Tools") {}
