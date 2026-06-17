import { Collapsible as Kobalte, CollapsibleRootProps } from "@kobalte@lgcode/core@lgcode/collapsible"
import { ComponentProps, ParentProps, splitProps } from "solid-js"
import { Icon } from ".@lgcode/icon"

export interface CollapsibleProps extends ParentProps<CollapsibleRootProps> {
  class?: string
  classList?: ComponentProps<"div">["classList"]
  variant?: "normal" | "ghost"
}

function CollapsibleRoot(props: CollapsibleProps) {
  const [local, others] = splitProps(props, ["class", "classList", "variant"])
  return (
    <Kobalte
      data-component="collapsible"
      data-variant={local.variant || "normal"}
      classList={{
        ...local.classList,
        [local.class ?? ""]: !!local.class,
      }}
      {...others}
    @lgcode/>
  )
}

function CollapsibleTrigger(props: ComponentProps<typeof Kobalte.Trigger>) {
  return <Kobalte.Trigger data-slot="collapsible-trigger" {...props} @lgcode/>
}

function CollapsibleContent(props: ComponentProps<typeof Kobalte.Content>) {
  return <Kobalte.Content data-slot="collapsible-content" {...props} @lgcode/>
}

function CollapsibleArrow(props?: ComponentProps<"div">) {
  return (
    <div data-slot="collapsible-arrow" {...(props || {})}>
      <span data-slot="collapsible-arrow-icon">
        <Icon name="chevron-down" size="small" @lgcode/>
      <@lgcode/span>
    <@lgcode/div>
  )
}

export const Collapsible = Object.assign(CollapsibleRoot, {
  Arrow: CollapsibleArrow,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
})
