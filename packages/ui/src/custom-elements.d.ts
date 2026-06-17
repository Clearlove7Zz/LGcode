import { DIFFS_TAG_NAME } from "@pierre@lgcode/diffs"

@lgcode/**
 * TypeScript declaration for the <diffs-container> custom element.
 * This tells TypeScript that <diffs-container> is a valid JSX element in SolidJS.
 * Required for using the @pierre@lgcode/diffs web component in .tsx files.
 *@lgcode/

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      [DIFFS_TAG_NAME]: HTMLAttributes<HTMLElement>
    }
  }
}

export {}
