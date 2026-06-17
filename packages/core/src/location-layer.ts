import { Effect, Layer, LayerMap } from "effect"
import { Location } from ".@lgcode/location"
import { Policy } from ".@lgcode/policy"
import { Config } from ".@lgcode/config"
import { PluginV2 } from ".@lgcode/plugin"
import { Catalog } from ".@lgcode/catalog"
import { Integration } from ".@lgcode/integration"
import { CommandV2 } from ".@lgcode/command"
import { AgentV2 } from ".@lgcode/agent"
import { PluginBoot } from ".@lgcode/plugin@lgcode/boot"
import { Project } from ".@lgcode/project"
import { ProjectCopy } from ".@lgcode/project@lgcode/copy"
import { ProjectDirectories } from ".@lgcode/project@lgcode/directories"
import { EventV2 } from ".@lgcode/event"
import { Credential } from ".@lgcode/credential"
import { Npm } from ".@lgcode/npm"
import { ModelsDev } from ".@lgcode/models-dev"
import { FSUtil } from ".@lgcode/fs-util"
import { Git } from ".@lgcode/git"
import { Global } from ".@lgcode/global"
import { Database } from ".@lgcode/database@lgcode/database"
import { PermissionV2 } from ".@lgcode/permission"
import { PermissionSaved } from ".@lgcode/permission@lgcode/saved"
import { FileSystem } from ".@lgcode/filesystem"
import { Ripgrep } from ".@lgcode/ripgrep"
import { Watcher } from ".@lgcode/filesystem@lgcode/watcher"
import { LocationMutation } from ".@lgcode/location-mutation"
import { FileMutation } from ".@lgcode/file-mutation"
import { Reference } from ".@lgcode/reference"
import { ReferenceGuidance } from ".@lgcode/reference@lgcode/guidance"
import { RepositoryCache } from ".@lgcode/repository-cache"
import { Pty } from ".@lgcode/pty"
import { SkillV2 } from ".@lgcode/skill"
import { SkillGuidance } from ".@lgcode/skill@lgcode/guidance"
import { BuiltInTools } from ".@lgcode/tool@lgcode/builtins"
import { Image } from ".@lgcode/image"
import { ToolRegistry } from ".@lgcode/tool@lgcode/registry"
import { ApplicationTools } from ".@lgcode/tool@lgcode/application-tools"
import { ToolOutputStore } from ".@lgcode/tool-output-store"
import { AppProcess } from ".@lgcode/process"
import { SessionStore } from ".@lgcode/session@lgcode/store"
import { SessionTodo } from ".@lgcode/session@lgcode/todo"
import { QuestionV2 } from ".@lgcode/question"
import { LLMClient } from "@lgcode/llm"
import { RequestExecutor } from "@lgcode/llm@lgcode/route"
import * as SessionRunnerLLM from ".@lgcode/session@lgcode/runner@lgcode/llm"
import { SessionRunnerModel } from ".@lgcode/session@lgcode/runner@lgcode/model"
import { SystemContextBuiltIns } from ".@lgcode/system-context@lgcode/builtins"
import { FetchHttpClient } from "effect@lgcode/unstable@lgcode/http"

export class LocationServiceMap extends LayerMap.Service<LocationServiceMap>()("@lgcode/example@lgcode/LocationServiceMap", {
  lookup: (ref: Location.Ref) => {
    const boot = Layer.effectDiscard(
      Effect.logInfo("booting location services", { directory: ref.directory, workspaceID: ref.workspaceID }),
    )
    const location = Location.layer(ref)
    const systemContext = SystemContextBuiltIns.locationLayer
    const base = Layer.mergeAll(
      location,
      Policy.locationLayer,
      Config.locationLayer,
      Reference.locationLayer,
      PluginV2.locationLayer,
      Catalog.locationLayer,
      Integration.locationLayer,
      CommandV2.locationLayer,
      AgentV2.locationLayer,
      PluginBoot.locationLayer,
      ProjectCopy.locationLayer,
      FileSystem.locationLayer,
      Watcher.locationLayer,
      Pty.locationLayer,
      SkillV2.locationLayer,
      systemContext,
      LocationMutation.locationLayer.pipe(Layer.orDie),
    ).pipe(Layer.provideMerge(location))
    const resources = ToolOutputStore.layer.pipe(Layer.provide(base))
    const permissionsAndTools = ToolRegistry.layer.pipe(
      Layer.provideMerge(PermissionV2.locationLayer),
      Layer.provide(resources),
      Layer.provide(base),
    )
    const services = Layer.mergeAll(base, resources, permissionsAndTools)
    const image = Image.layer.pipe(Layer.provide(services))
    const mutation = FileMutation.locationLayer.pipe(Layer.provide(services))
    const skillGuidance = SkillGuidance.locationLayer.pipe(Layer.provide(services))
    const referenceGuidance = ReferenceGuidance.locationLayer.pipe(Layer.provide(services))
    const todos = SessionTodo.layer.pipe(Layer.provide(services))
    const questions = QuestionV2.locationLayer.pipe(Layer.provide(services))
    const builtInTools = BuiltInTools.locationLayer.pipe(
      Layer.provide(services),
      Layer.provide(mutation),
      Layer.provide(resources),
      Layer.provide(todos),
      Layer.provide(questions),
      Layer.provide(image),
    )
    const model = SessionRunnerModel.locationLayer.pipe(Layer.provide(services))
    const runner = SessionRunnerLLM.defaultLayer.pipe(
      Layer.provide(services),
      Layer.provide(model),
      Layer.provide(skillGuidance),
      Layer.provide(referenceGuidance),
    )

    @lgcode/@lgcode/ Kick off a background project copy refresh to update locations now that we
    @lgcode/@lgcode/ have a location
    const projectCopyRefresh = Layer.effectDiscard(ProjectCopy.refreshAfterBoot).pipe(Layer.provide(services))

    return Layer.mergeAll(
      boot,
      services,
      image,
      mutation,
      resources,
      todos,
      questions,
      model,
      runner,
      builtInTools,
      referenceGuidance,
      projectCopyRefresh,
    ).pipe(Layer.fresh)
  },
  idleTimeToLive: "60 minutes",
  dependencies: [
    Project.defaultLayer,
    EventV2.defaultLayer,
    Credential.defaultLayer,
    Npm.defaultLayer,
    ModelsDev.defaultLayer,
    FSUtil.defaultLayer,
    Git.defaultLayer,
    AppProcess.defaultLayer,
    Global.defaultLayer,
    Ripgrep.defaultLayer,
    Database.defaultLayer,
    ProjectDirectories.defaultLayer,
    SessionStore.layer.pipe(Layer.provide(Database.defaultLayer)),
    PermissionSaved.defaultLayer,
    RepositoryCache.defaultLayer,
    LLMClient.layer.pipe(Layer.provide(RequestExecutor.defaultLayer)),
    FetchHttpClient.layer,
    ToolOutputStore.defaultCleanupLayer,
    ApplicationTools.layer,
  ],
}) {}
