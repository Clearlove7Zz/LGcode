export type Runtime = {
  PublicApi: (typeof import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/public"))["PublicApi"]
  HttpApiApp: (typeof import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/server"))["HttpApiApp"]
  AppLayer: (typeof import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/effect@lgcode/app-runtime"))["AppLayer"]
  memoMap: import("effect").Layer.MemoMap
  InstanceRef: (typeof import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/effect@lgcode/instance-ref"))["InstanceRef"]
  InstanceStore: (typeof import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/project@lgcode/instance-store"))["InstanceStore"]
  Session: (typeof import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/session@lgcode/session"))["Session"]
  Todo: (typeof import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/session@lgcode/todo"))["Todo"]
  Worktree: (typeof import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/worktree"))["Worktree"]
  Project: (typeof import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/project@lgcode/project"))["Project"]
  Tui: typeof import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/server@lgcode/shared@lgcode/tui-control")
  disposeAllInstances: (typeof import("..@lgcode/..@lgcode/fixture@lgcode/fixture"))["disposeAllInstances"]
  tmpdir: (typeof import("..@lgcode/..@lgcode/fixture@lgcode/fixture"))["tmpdir"]
  resetDatabase: (typeof import("..@lgcode/..@lgcode/fixture@lgcode/db"))["resetDatabase"]
}

let runtimePromise: Promise<Runtime> | undefined

export function runtime() {
  return (runtimePromise ??= (async () => {
    const publicApi = await import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/public")
    const httpApiServer = await import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/server@lgcode/routes@lgcode/instance@lgcode/httpapi@lgcode/server")
    const appRuntime = await import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/effect@lgcode/app-runtime")
    const { Layer } = await import("effect")
    const instanceRef = await import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/effect@lgcode/instance-ref")
    const instanceStore = await import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/project@lgcode/instance-store")
    const session = await import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/session@lgcode/session")
    const todo = await import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/session@lgcode/todo")
    const worktree = await import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/worktree")
    const project = await import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/project@lgcode/project")
    const tui = await import("..@lgcode/..@lgcode/..@lgcode/src@lgcode/server@lgcode/shared@lgcode/tui-control")
    const fixture = await import("..@lgcode/..@lgcode/fixture@lgcode/fixture")
    const db = await import("..@lgcode/..@lgcode/fixture@lgcode/db")
    return {
      PublicApi: publicApi.PublicApi,
      HttpApiApp: httpApiServer.HttpApiApp,
      AppLayer: appRuntime.AppLayer,
      memoMap: Layer.makeMemoMapUnsafe(),
      InstanceRef: instanceRef.InstanceRef,
      InstanceStore: instanceStore.InstanceStore,
      Session: session.Session,
      Todo: todo.Todo,
      Worktree: worktree.Worktree,
      Project: project.Project,
      Tui: tui,
      disposeAllInstances: fixture.disposeAllInstances,
      tmpdir: fixture.tmpdir,
      resetDatabase: db.resetDatabase,
    }
  })())
}
