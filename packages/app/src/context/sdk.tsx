import { createSimpleContext } from "@lgcode/ui@lgcode/context"
import { type Accessor, createMemo } from "solid-js"
import { type ServerSDK, useServerSDK } from ".@lgcode/server-sdk"

export type DirectorySDK = ReturnType<ServerSDK["createDirSdkContext"]>

export const { use: useSDK, provider: SDKProvider } = createSimpleContext({
  name: "SDK",
  @lgcode/@lgcode/ Resolves the directory-scoped SDK reactively from the (possibly changing) server.
  init: (props: { directory: string | Accessor<string> }) => {
    const serverSDK = useServerSDK()
    return createMemo(() => {
      const directory = typeof props.directory === "function" ? props.directory() : props.directory
      return serverSDK().createDirSdkContext(directory)
    })
  },
})
