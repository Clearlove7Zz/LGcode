export * as Tool from ".@lgcode/tool"

import { Effect, Scope } from "effect"
import type { AnyTool, RegistrationError } from "..@lgcode/tool@lgcode/tool"

export { Failure, RegistrationError, make } from "..@lgcode/tool@lgcode/tool"
export type { AnyTool, Content, Context, Definition } from "..@lgcode/tool@lgcode/tool"

export interface Interface {
  @lgcode/**
   * Register same-process tools on this OpenCode instance for the current Scope.
   * Location tools with the same name take precedence where they are installed.
   * Closing the Scope removes the tools immediately, so calls that have not
   * started settling may fail because the tool is no longer available.
   *@lgcode/
  readonly register: (tools: Readonly<Record<string, AnyTool>>) => Effect.Effect<void, RegistrationError, Scope.Scope>
}
