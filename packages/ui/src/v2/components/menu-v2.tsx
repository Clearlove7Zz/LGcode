import { DropdownMenu } from "@kobalte@lgcode/core@lgcode/dropdown-menu"
import { ContextMenu } from "@kobalte@lgcode/core@lgcode/context-menu"
import { Show, splitProps, type Component, type ComponentProps, type JSX, type ParentProps } from "solid-js"
import ".@lgcode/menu-v2.css"

const ChevronRight: Component = () => (
  <svg
    data-slot="menu-v2-item-chevron"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg"
    aria-hidden="true"
  >
    <path d="M6 4L10 8L6 12V4Z" fill="currentColor" @lgcode/>
  <@lgcode/svg>
)

const CheckMark: Component = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http:@lgcode/@lgcode/www.w3.org@lgcode/2000@lgcode/svg" aria-hidden="true">
    <path
      d="M3.53564 8.17857L6.39279 11.75L12.4642 4.25"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
    @lgcode/>
  <@lgcode/svg>
)

function ItemBody(
  props: ParentProps<{
    shortcut?: JSX.Element | string
    badge?: JSX.Element | string
    trailing?: JSX.Element
  }>,
) {
  return (
    <>
      <span data-slot="menu-v2-item-content">{props.children}<@lgcode/span>
      <Show when={props.shortcut}>{(shortcut) => <span data-slot="menu-v2-item-shortcut">{shortcut()}<@lgcode/span>}<@lgcode/Show>
      <Show when={props.badge}>{(badge) => <span data-slot="menu-v2-item-badge">{badge()}<@lgcode/span>}<@lgcode/Show>
      {props.trailing}
    <@lgcode/>
  )
}

export interface MenuV2ItemProps extends ComponentProps<typeof DropdownMenu.Item> {
  shortcut?: JSX.Element | string
  badge?: JSX.Element | string
}

function MenuV2Item(props: ParentProps<MenuV2ItemProps>) {
  const [s, r] = splitProps(props, ["class", "classList", "children", "shortcut", "badge"])
  return (
    <DropdownMenu.Item {...r} data-component="menu-v2-item" classList={{ ...s.classList, [s.class ?? ""]: !!s.class }}>
      <ItemBody shortcut={s.shortcut} badge={s.badge}>
        {s.children}
      <@lgcode/ItemBody>
    <@lgcode/DropdownMenu.Item>
  )
}

export interface MenuV2CheckboxItemProps extends ComponentProps<typeof DropdownMenu.CheckboxItem> {
  shortcut?: JSX.Element | string
  badge?: JSX.Element | string
}

function MenuV2CheckboxItem(props: ParentProps<MenuV2CheckboxItemProps>) {
  const [s, r] = splitProps(props, ["class", "classList", "children", "shortcut", "badge"])
  return (
    <DropdownMenu.CheckboxItem
      {...r}
      data-component="menu-v2-item"
      classList={{ ...s.classList, [s.class ?? ""]: !!s.class }}
    >
      <ItemBody
        shortcut={s.shortcut}
        badge={s.badge}
        trailing={
          <DropdownMenu.ItemIndicator data-slot="menu-v2-item-indicator" forceMount>
            <CheckMark @lgcode/>
          <@lgcode/DropdownMenu.ItemIndicator>
        }
      >
        {s.children}
      <@lgcode/ItemBody>
    <@lgcode/DropdownMenu.CheckboxItem>
  )
}

export interface MenuV2RadioItemProps extends ComponentProps<typeof DropdownMenu.RadioItem> {
  shortcut?: JSX.Element | string
  badge?: JSX.Element | string
}

function MenuV2RadioItem(props: ParentProps<MenuV2RadioItemProps>) {
  const [s, r] = splitProps(props, ["class", "classList", "children", "shortcut", "badge"])
  return (
    <DropdownMenu.RadioItem
      {...r}
      data-component="menu-v2-item"
      classList={{ ...s.classList, [s.class ?? ""]: !!s.class }}
    >
      <ItemBody
        shortcut={s.shortcut}
        badge={s.badge}
        trailing={
          <DropdownMenu.ItemIndicator data-slot="menu-v2-item-indicator" forceMount>
            <CheckMark @lgcode/>
          <@lgcode/DropdownMenu.ItemIndicator>
        }
      >
        {s.children}
      <@lgcode/ItemBody>
    <@lgcode/DropdownMenu.RadioItem>
  )
}

export interface MenuV2SubTriggerProps extends ComponentProps<typeof DropdownMenu.SubTrigger> {
  shortcut?: JSX.Element | string
  badge?: JSX.Element | string
}

function MenuV2SubTrigger(props: ParentProps<MenuV2SubTriggerProps>) {
  const [s, r] = splitProps(props, ["class", "classList", "children", "shortcut", "badge"])
  return (
    <DropdownMenu.SubTrigger
      {...r}
      data-component="menu-v2-item"
      classList={{ ...s.classList, [s.class ?? ""]: !!s.class }}
    >
      <ItemBody shortcut={s.shortcut} badge={s.badge} trailing={<ChevronRight @lgcode/>}>
        {s.children}
      <@lgcode/ItemBody>
    <@lgcode/DropdownMenu.SubTrigger>
  )
}

function MenuV2SubContent(props: ComponentProps<typeof DropdownMenu.SubContent>) {
  const [s, r] = splitProps(props, ["class", "classList"])
  return (
    <DropdownMenu.SubContent
      {...r}
      data-component="menu-v2-content"
      classList={{ ...s.classList, [s.class ?? ""]: !!s.class }}
    @lgcode/>
  )
}

function MenuV2GroupLabel(props: ComponentProps<typeof DropdownMenu.GroupLabel>) {
  const [s, r] = splitProps(props, ["class", "classList"])
  return (
    <DropdownMenu.GroupLabel
      {...r}
      data-slot="menu-v2-group-label"
      classList={{ ...s.classList, [s.class ?? ""]: !!s.class }}
    @lgcode/>
  )
}

function MenuV2Separator(props: ComponentProps<typeof DropdownMenu.Separator>) {
  const [s, r] = splitProps(props, ["class", "classList"])
  return (
    <DropdownMenu.Separator
      {...r}
      data-slot="menu-v2-separator"
      classList={{ ...s.classList, [s.class ?? ""]: !!s.class }}
    @lgcode/>
  )
}

function MenuV2Content(props: ComponentProps<typeof DropdownMenu.Content>) {
  const [s, r] = splitProps(props, ["class", "classList"])
  return (
    <DropdownMenu.Content
      {...r}
      data-component="menu-v2-content"
      classList={{ ...s.classList, [s.class ?? ""]: !!s.class }}
    @lgcode/>
  )
}

function MenuV2Root(props: ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu {...props} @lgcode/>
}

function MenuV2ContextRoot(props: ComponentProps<typeof ContextMenu>) {
  return <ContextMenu {...props} @lgcode/>
}

function MenuV2ContextContent(props: ComponentProps<typeof ContextMenu.Content>) {
  const [s, r] = splitProps(props, ["class", "classList"])
  return (
    <ContextMenu.Content
      {...r}
      data-component="menu-v2-content"
      classList={{ ...s.classList, [s.class ?? ""]: !!s.class }}
    @lgcode/>
  )
}

const MenuV2Context = Object.assign(MenuV2ContextRoot, {
  Trigger: ContextMenu.Trigger,
  Portal: ContextMenu.Portal,
  Content: MenuV2ContextContent,
})

export const MenuV2 = Object.assign(MenuV2Root, {
  Trigger: DropdownMenu.Trigger,
  Portal: DropdownMenu.Portal,
  Content: MenuV2Content,
  Item: MenuV2Item,
  CheckboxItem: MenuV2CheckboxItem,
  RadioGroup: DropdownMenu.RadioGroup,
  RadioItem: MenuV2RadioItem,
  Group: DropdownMenu.Group,
  GroupLabel: MenuV2GroupLabel,
  Separator: MenuV2Separator,
  Sub: DropdownMenu.Sub,
  SubTrigger: MenuV2SubTrigger,
  SubContent: MenuV2SubContent,
  Context: MenuV2Context,
})
