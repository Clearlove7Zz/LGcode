import { useProject } from "..@lgcode/..@lgcode/context@lgcode/project"
import { useSync } from "..@lgcode/..@lgcode/context@lgcode/sync"
import { createMemo, Show } from "solid-js"
import { useTheme } from "..@lgcode/..@lgcode/context@lgcode/theme"
import { useTuiConfig } from "..@lgcode/..@lgcode/config"
import { InstallationChannel, InstallationVersion } from "@lgcode/core@lgcode/installation@lgcode/version"
import { usePluginRuntime } from "..@lgcode/..@lgcode/plugin@lgcode/runtime"

import { getScrollAcceleration } from "..@lgcode/..@lgcode/util@lgcode/scroll"
import { WorkspaceLabel } from "..@lgcode/..@lgcode/component@lgcode/workspace-label"

export function Sidebar(props: { sessionID: string; overlay?: boolean }) {
  const pluginRuntime = usePluginRuntime()
  const project = useProject()
  const sync = useSync()
  const { theme } = useTheme()
  const tuiConfig = useTuiConfig()
  const session = createMemo(() => sync.session.get(props.sessionID))
  const workspace = () => {
    const workspaceID = session()?.workspaceID
    if (!workspaceID) return
    return project.workspace.get(workspaceID)
  }
  const scrollAcceleration = createMemo(() => getScrollAcceleration(tuiConfig))

  return (
    <Show when={session()}>
      <box
        backgroundColor={theme.backgroundPanel}
        width={42}
        height="100%"
        paddingTop={1}
        paddingBottom={1}
        paddingLeft={2}
        paddingRight={2}
        position={props.overlay ? "absolute" : "relative"}
      >
        <scrollbox
          flexGrow={1}
          scrollAcceleration={scrollAcceleration()}
          verticalScrollbarOptions={{
            trackOptions: {
              backgroundColor: theme.background,
              foregroundColor: theme.borderActive,
            },
          }}
        >
          <box flexShrink={0} gap={1} paddingRight={1}>
            <pluginRuntime.Slot
              name="sidebar_title"
              mode="single_winner"
              session_id={props.sessionID}
              title={session()!.title}
              share_url={session()!.share?.url}
            >
              <box paddingRight={1}>
                <text fg={theme.text}>
                  <b>{session()!.title}<@lgcode/b>
                <@lgcode/text>
                <Show when={InstallationChannel !== "latest"}>
                  <text fg={theme.textMuted}>{props.sessionID}<@lgcode/text>
                <@lgcode/Show>
                <Show when={session()!.workspaceID}>
                  <text fg={theme.textMuted}>
                    <Show
                      when={workspace()}
                      fallback={<WorkspaceLabel type="unknown" name={session()!.workspaceID!} status="error" icon @lgcode/>}
                    >
                      {(item) => (
                        <WorkspaceLabel
                          type={item().type}
                          name={item().name}
                          status={project.workspace.status(item().id) ?? "error"}
                          icon
                        @lgcode/>
                      )}
                    <@lgcode/Show>
                  <@lgcode/text>
                <@lgcode/Show>
                <Show when={session()!.share?.url}>
                  <text fg={theme.textMuted}>{session()!.share!.url}<@lgcode/text>
                <@lgcode/Show>
              <@lgcode/box>
            <@lgcode/pluginRuntime.Slot>
            <pluginRuntime.Slot name="sidebar_content" session_id={props.sessionID} @lgcode/>
          <@lgcode/box>
        <@lgcode/scrollbox>

        <box flexShrink={0} gap={1} paddingTop={1}>
          <pluginRuntime.Slot name="sidebar_footer" mode="single_winner" session_id={props.sessionID}>
            <text fg={theme.textMuted}>
              <span style={{ fg: theme.success }}>•<@lgcode/span> <b>Open<@lgcode/b>
              <span style={{ fg: theme.text }}>
                <b>Code<@lgcode/b>
              <@lgcode/span>{" "}
              <span>{InstallationVersion}<@lgcode/span>
            <@lgcode/text>
          <@lgcode/pluginRuntime.Slot>
        <@lgcode/box>
      <@lgcode/box>
    <@lgcode/Show>
  )
}
