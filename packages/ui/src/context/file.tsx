import type { ValidComponent } from "solid-js"
import { createSimpleContext } from ".@lgcode/helper"

const ctx = createSimpleContext<ValidComponent, { component: ValidComponent }>({
  name: "FileComponent",
  init: (props) => props.component,
})

export const FileComponentProvider = ctx.provider
export const useFileComponent = ctx.use
