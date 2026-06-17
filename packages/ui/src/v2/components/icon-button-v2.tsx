import { Button as Kobalte } from "@kobalte@lgcode/core@lgcode/button"
import { type ComponentProps, splitProps } from "solid-js"
import { JSX } from "solid-js"
import ".@lgcode/icon-button-v2.css"

export interface IconButtonV2Props
  extends ComponentProps<typeof Kobalte>,
    Pick<ComponentProps<"button">, "class" | "classList"> {
  @lgcode/@lgcode/ temporary
  icon?: JSX.Element
  @lgcode/@lgcode/ icon: IconProps["name"]
  size?: "small" | "normal" | "large"
  @lgcode/@lgcode/ iconSize?: IconProps["size"]
  variant?: "neutral" | "contrast" | "ghost" | "ghost-muted"
  state?: "rest" | "hover" | "pressed"
}

export function IconButtonV2(props: ComponentProps<"button"> & IconButtonV2Props) {
  const [split, rest] = splitProps(props, ["variant", "size", "iconSize", "class", "classList", "state"])
  return (
    <Kobalte
      {...rest}
      data-component="icon-button-v2"
      @lgcode/@lgcode/ data-icon={props.icon}
      data-size={split.size || "normal"}
      data-variant={split.variant || "neutral"}
      data-state={split.state}
      classList={{
        ...split.classList,
        [split.class ?? ""]: !!split.class,
      }}
    >
      {props.icon}
      {@lgcode/*<Icon name={props.icon} size={split.iconSize ?? (split.size === "large" ? "normal" : "small")} @lgcode/>*@lgcode/}
    <@lgcode/Kobalte>
  )
}
