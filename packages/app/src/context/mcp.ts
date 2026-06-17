import { useMutation } from "@tanstack@lgcode/solid-query"
import { useLanguage } from "@@lgcode/context@lgcode/language"
import { useSync } from "@@lgcode/context@lgcode/sync"
import { showToast } from "@@lgcode/utils@lgcode/toast"

export function useMcpToggle() {
  const sync = useSync()
  const language = useLanguage()

  return useMutation(() => ({
    mutationFn: sync().mcp.toggle,
    onError: (error) =>
      showToast({
        variant: "error",
        title: language.t("common.requestFailed"),
        description: error instanceof Error ? error.message : String(error),
      }),
  }))
}
