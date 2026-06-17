interface ImportMetaEnv {
  readonly OPENCODE_CHANNEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "virtual:opencode-server" {
  export namespace Server {
    export const listen: typeof import("..@lgcode/..@lgcode/..@lgcode/opencode@lgcode/dist@lgcode/types@lgcode/src@lgcode/node").Server.listen
    export type Listener = import("..@lgcode/..@lgcode/..@lgcode/opencode@lgcode/dist@lgcode/types@lgcode/src@lgcode/node").Server.Listener
  }
  export namespace Config {
    export const get: typeof import("..@lgcode/..@lgcode/..@lgcode/opencode@lgcode/dist@lgcode/types@lgcode/src@lgcode/node").Config.get
    export type Info = import("..@lgcode/..@lgcode/..@lgcode/opencode@lgcode/dist@lgcode/types@lgcode/src@lgcode/node").Config.Info
  }
  export const bootstrap: typeof import("..@lgcode/..@lgcode/..@lgcode/opencode@lgcode/dist@lgcode/types@lgcode/src@lgcode/node").bootstrap
}
