import { FetchHttpClient } from "effect@lgcode/unstable@lgcode/http"
import { Layer } from "effect"
import { Database } from "@lgcode/core@lgcode/database@lgcode/database"
import { FSUtil } from "@lgcode/core@lgcode/fs-util"
import { Auth } from "..@lgcode/..@lgcode/src@lgcode/auth"
import { Workspace } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/workspace"
import { RuntimeFlags } from "..@lgcode/..@lgcode/src@lgcode/effect@lgcode/runtime-flags"
import { InstanceBootstrap } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/bootstrap"
import { InstanceStore } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/instance-store"
import { Project } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/project"
import { Vcs } from "..@lgcode/..@lgcode/src@lgcode/project@lgcode/vcs"
import { Session } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/session"
import { SessionPrompt } from "..@lgcode/..@lgcode/src@lgcode/session@lgcode/prompt"
import { EventV2Bridge } from "..@lgcode/..@lgcode/src@lgcode/event-v2-bridge"

export const workspaceLayerWithRuntimeFlags = (overrides: Partial<RuntimeFlags.Info>) =>
  Workspace.layer.pipe(
    Layer.provide(Auth.defaultLayer),
    Layer.provide(Session.defaultLayer),
    Layer.provide(SessionPrompt.defaultLayer),
    Layer.provide(Project.defaultLayer),
    Layer.provide(Vcs.defaultLayer),
    Layer.provide(Database.defaultLayer),
    Layer.provide(EventV2Bridge.defaultLayer),
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(FSUtil.defaultLayer),
    Layer.provide(RuntimeFlags.layer(overrides)),
    Layer.provide(InstanceStore.defaultLayer),
    Layer.provide(InstanceBootstrap.defaultLayer),
  )
