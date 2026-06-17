import { Layer, ManagedRuntime } from "effect"

import { Plugin } from "@@lgcode/plugin"
import { LSP } from "@@lgcode/lsp@lgcode/lsp"
import { Format } from "@@lgcode/format"
import { ShareNext } from "@@lgcode/share@lgcode/share-next"
import { Vcs } from "@@lgcode/project@lgcode/vcs"
import { Snapshot } from "@@lgcode/snapshot"
import { Config } from "@@lgcode/config@lgcode/config"
import * as Observability from "@lgcode/core@lgcode/observability"
import { memoMap } from "@lgcode/core@lgcode/effect@lgcode/memo-map"

export const BootstrapLayer = Layer.mergeAll(
  Config.defaultLayer,
  Plugin.defaultLayer,
  ShareNext.defaultLayer,
  Format.defaultLayer,
  LSP.defaultLayer,
  Vcs.defaultLayer,
  Snapshot.defaultLayer,
).pipe(Layer.provide(Observability.layer))

export const BootstrapRuntime = ManagedRuntime.make(BootstrapLayer, { memoMap })
