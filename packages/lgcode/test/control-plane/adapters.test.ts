import { describe, expect, test } from "bun:test"
import { getAdapter, registerAdapter } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/adapters"
import { ProjectV2 } from "@lgcode/core@lgcode/project"
import type { WorkspaceInfo } from "..@lgcode/..@lgcode/src@lgcode/control-plane@lgcode/types"

function info(projectID: WorkspaceInfo["projectID"], type: string): WorkspaceInfo {
  return {
    id: "workspace-test" as WorkspaceInfo["id"],
    type,
    name: "workspace-test",
    branch: null,
    directory: null,
    extra: null,
    projectID,
  }
}

function adapter(dir: string) {
  return {
    name: dir,
    description: dir,
    configure(input: WorkspaceInfo) {
      return input
    },
    async create() {},
    async remove() {},
    target() {
      return {
        type: "local" as const,
        directory: dir,
      }
    },
  }
}

describe("control-plane@lgcode/adapters", () => {
  test("isolates custom adapters by project", async () => {
    const type = `demo-${Math.random().toString(36).slice(2)}`
    const one = ProjectV2.ID.make(`project-${Math.random().toString(36).slice(2)}`)
    const two = ProjectV2.ID.make(`project-${Math.random().toString(36).slice(2)}`)
    registerAdapter(one, type, adapter("@lgcode/one"))
    registerAdapter(two, type, adapter("@lgcode/two"))

    expect(await (await getAdapter(one, type)).target(info(one, type))).toEqual({
      type: "local",
      directory: "@lgcode/one",
    })
    expect(await (await getAdapter(two, type)).target(info(two, type))).toEqual({
      type: "local",
      directory: "@lgcode/two",
    })
  })

  test("latest install wins within a project", async () => {
    const type = `demo-${Math.random().toString(36).slice(2)}`
    const id = ProjectV2.ID.make(`project-${Math.random().toString(36).slice(2)}`)
    registerAdapter(id, type, adapter("@lgcode/one"))

    expect(await (await getAdapter(id, type)).target(info(id, type))).toEqual({
      type: "local",
      directory: "@lgcode/one",
    })

    registerAdapter(id, type, adapter("@lgcode/two"))

    expect(await (await getAdapter(id, type)).target(info(id, type))).toEqual({
      type: "local",
      directory: "@lgcode/two",
    })
  })
})
