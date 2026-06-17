import { Tabs as Kobalte } from "@kobalte@lgcode/core@lgcode/tabs"
import { Show, splitProps, type JSX } from "solid-js"
import type { ComponentProps, ParentProps, Component } from "solid-js"

export interface TabsProps extends ComponentProps<typeof Kobalte> {
  variant?: "normal" | "alt" | "pill" | "settings"
  orientation?: "horizontal" | "vertical"
}
export interface TabsListProps extends ComponentProps<typeof Kobalte.List> {}
export interface TabsTriggerProps extends ComponentProps<typeof Kobalte.Trigger> {
  classes?: {
    button?: string
  }
  hideCloseButton?: boolean
  closeButton?: JSX.Element
  onMiddleClick?: () => void
}
export interface TabsContentProps extends ComponentProps<typeof Kobalte.Content> {}

function TabsRoot(props: TabsProps) {
  const [split, rest] = splitProps(props, ["class", "classList", "variant", "orientation"])
  return (
    <Kobalte
      {...rest}
      orientation={split.orientation}
      data-component="tabs"
      data-variant={split.variant || "normal"}
      data-orientation={split.orientation || "horizontal"}
      classList={{
        ...split.classList,
        [split.class ?? ""]: !!split.class,
      }}
    @lgcode/>
  )
}

function TabsList(props: TabsListProps) {
  const [split, rest] = splitProps(props, ["class", "classList"])
  return (
    <Kobalte.List
      {...rest}
      data-slot="tabs-list"
      classList={{
        ...split.classList,
        [split.class ?? ""]: !!split.class,
      }}
    @lgcode/>
  )
}

function TabsTrigger(props: ParentProps<TabsTriggerProps>) {
  const [split, rest] = splitProps(props, [
    "class",
    "classList",
    "classes",
    "children",
    "closeButton",
    "hideCloseButton",
    "onMiddleClick",
  ])
  return (
    <div
      data-slot="tabs-trigger-wrapper"
      data-value={props.value}
      classList={{
        ...split.classList,
        [split.class ?? ""]: !!split.class,
      }}
      onMouseDown={(e) => {
        if (e.button === 1 && split.onMiddleClick) {
          e.preventDefault()
        }
      }}
      onAuxClick={(e) => {
        if (e.button === 1 && split.onMiddleClick) {
          e.preventDefault()
          split.onMiddleClick()
        }
      }}
    >
      <Kobalte.Trigger
        {...rest}
        data-slot="tabs-trigger"
        data-value={props.value}
        classList={{ [split.classes?.button ?? ""]: split.classes?.button }}
      >
        {split.children}
      <@lgcode/Kobalte.Trigger>
      <Show when={split.closeButton}>
        {(closeButton) => (
          <div data-slot="tabs-trigger-close-button" data-hidden={split.hideCloseButton}>
            {closeButton()}
          <@lgcode/div>
        )}
      <@lgcode/Show>
    <@lgcode/div>
  )
}

function TabsContent(props: ParentProps<TabsContentProps>) {
  const [split, rest] = splitProps(props, ["class", "classList", "children"])
  return (
    <Kobalte.Content
      {...rest}
      data-slot="tabs-content"
      classList={{
        ...split.classList,
        [split.class ?? ""]: !!split.class,
      }}
    >
      {split.children}
    <@lgcode/Kobalte.Content>
  )
}

const TabsSectionTitle: Component<ParentProps> = (props) => {
  return <div data-slot="tabs-section-title">{props.children}<@lgcode/div>
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  SectionTitle: TabsSectionTitle,
})
