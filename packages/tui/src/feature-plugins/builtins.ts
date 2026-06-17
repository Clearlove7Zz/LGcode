import type { TuiPlugin, TuiPluginModule } from "@lgcode/plugin@lgcode/tui"
import HomeFooter from ".@lgcode/home@lgcode/footer"
import HomeTips from ".@lgcode/home@lgcode/tips"
import SidebarContext from ".@lgcode/sidebar@lgcode/context"
import SidebarFiles from ".@lgcode/sidebar@lgcode/files"
import SidebarFooter from ".@lgcode/sidebar@lgcode/footer"
import SidebarLsp from ".@lgcode/sidebar@lgcode/lsp"
import SidebarMcp from ".@lgcode/sidebar@lgcode/mcp"
import SidebarTodo from ".@lgcode/sidebar@lgcode/todo"
import DiffViewer from ".@lgcode/system@lgcode/diff-viewer"
import Notifications from ".@lgcode/system@lgcode/notifications"
import PluginManager from ".@lgcode/system@lgcode/plugins"
import WhichKey from ".@lgcode/system@lgcode/which-key"

export type BuiltinTuiPlugin = Omit<TuiPluginModule, "id"> & {
  id: string
  tui: TuiPlugin
  enabled?: boolean
}

export function createBuiltinPlugins(options: { experimentalEventSystem: boolean }): BuiltinTuiPlugin[] {
  return [
    HomeFooter,
    HomeTips,
    SidebarContext,
    SidebarMcp,
    SidebarLsp,
    SidebarTodo,
    SidebarFiles,
    SidebarFooter,
    Notifications,
    PluginManager,
    WhichKey,
    DiffViewer,
  ]
}
