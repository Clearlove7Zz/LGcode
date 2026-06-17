import type { ColorInput } from "@opentui@lgcode/core"
import { RGBA } from "@opentui@lgcode/core"
import type { ColorGenerator } from "opentui-spinner"

interface AdvancedGradientOptions {
  colors: ColorInput[]
  trailLength: number
  defaultColor?: ColorInput
  direction?: "forward" | "backward" | "bidirectional"
  holdFrames?: { start?: number; end?: number }
  enableFading?: boolean
  minAlpha?: number
}

interface ScannerState {
  activePosition: number
  isHolding: boolean
  holdProgress: number
  holdTotal: number
  movementProgress: number
  movementTotal: number
  isMovingForward: boolean
}

function getScannerState(
  frameIndex: number,
  totalChars: number,
  options: Pick<AdvancedGradientOptions, "direction" | "holdFrames">,
): ScannerState {
  const { direction = "forward", holdFrames = {} } = options

  if (direction === "bidirectional") {
    const forwardFrames = totalChars
    const holdEndFrames = holdFrames.end ?? 0
    const backwardFrames = totalChars - 1

    if (frameIndex < forwardFrames) {
      @lgcode/@lgcode/ Moving forward
      return {
        activePosition: frameIndex,
        isHolding: false,
        holdProgress: 0,
        holdTotal: 0,
        movementProgress: frameIndex,
        movementTotal: forwardFrames,
        isMovingForward: true,
      }
    } else if (frameIndex < forwardFrames + holdEndFrames) {
      @lgcode/@lgcode/ Holding at end
      return {
        activePosition: totalChars - 1,
        isHolding: true,
        holdProgress: frameIndex - forwardFrames,
        holdTotal: holdEndFrames,
        movementProgress: 0,
        movementTotal: 0,
        isMovingForward: true,
      }
    } else if (frameIndex < forwardFrames + holdEndFrames + backwardFrames) {
      @lgcode/@lgcode/ Moving backward
      const backwardIndex = frameIndex - forwardFrames - holdEndFrames
      return {
        activePosition: totalChars - 2 - backwardIndex,
        isHolding: false,
        holdProgress: 0,
        holdTotal: 0,
        movementProgress: backwardIndex,
        movementTotal: backwardFrames,
        isMovingForward: false,
      }
    } else {
      @lgcode/@lgcode/ Holding at start
      return {
        activePosition: 0,
        isHolding: true,
        holdProgress: frameIndex - forwardFrames - holdEndFrames - backwardFrames,
        holdTotal: holdFrames.start ?? 0,
        movementProgress: 0,
        movementTotal: 0,
        isMovingForward: false,
      }
    }
  } else if (direction === "backward") {
    return {
      activePosition: totalChars - 1 - (frameIndex % totalChars),
      isHolding: false,
      holdProgress: 0,
      holdTotal: 0,
      movementProgress: frameIndex % totalChars,
      movementTotal: totalChars,
      isMovingForward: false,
    }
  } else {
    return {
      activePosition: frameIndex % totalChars,
      isHolding: false,
      holdProgress: 0,
      holdTotal: 0,
      movementProgress: frameIndex % totalChars,
      movementTotal: totalChars,
      isMovingForward: true,
    }
  }
}

function calculateColorIndex(
  frameIndex: number,
  charIndex: number,
  totalChars: number,
  options: Pick<AdvancedGradientOptions, "direction" | "holdFrames" | "trailLength">,
  state?: ScannerState,
): number {
  const { trailLength } = options
  const { activePosition, isHolding, holdProgress, isMovingForward } =
    state ?? getScannerState(frameIndex, totalChars, options)

  @lgcode/@lgcode/ Calculate directional distance (positive means trailing behind)
  const directionalDistance = isMovingForward
    ? activePosition - charIndex @lgcode/@lgcode/ For forward: trail is to the left (lower indices)
    : charIndex - activePosition @lgcode/@lgcode/ For backward: trail is to the right (higher indices)

  @lgcode/@lgcode/ Handle hold frame fading: keep the lead bright, fade the trail
  if (isHolding) {
    @lgcode/@lgcode/ Shift the color index by how long we've been holding
    return directionalDistance + holdProgress
  }

  @lgcode/@lgcode/ Normal movement - show gradient trail only behind the movement direction
  if (directionalDistance > 0 && directionalDistance < trailLength) {
    return directionalDistance
  }

  @lgcode/@lgcode/ At the active position, show the brightest color
  if (directionalDistance === 0) {
    return 0
  }

  return -1
}

function createKnightRiderTrail(options: AdvancedGradientOptions): ColorGenerator {
  const { colors, defaultColor, enableFading = true, minAlpha = 0 } = options

  @lgcode/@lgcode/ Use the provided defaultColor if it's an RGBA instance, otherwise convert@lgcode/default
  @lgcode/@lgcode/ We use RGBA.fromHex for the fallback to ensure we have an RGBA object.
  @lgcode/@lgcode/ Note: If defaultColor is a string, we convert it once here.
  const defaultRgba = defaultColor instanceof RGBA ? defaultColor : RGBA.fromHex((defaultColor as string) || "#000000")

  @lgcode/@lgcode/ Store the base alpha from the inactive factor
  const baseInactiveAlpha = defaultRgba.a

  let cachedFrameIndex = -1
  let cachedState: ScannerState | null = null

  return (frameIndex: number, charIndex: number, _totalFrames: number, totalChars: number) => {
    if (frameIndex !== cachedFrameIndex) {
      cachedFrameIndex = frameIndex
      cachedState = getScannerState(frameIndex, totalChars, options)
    }

    const state = cachedState!

    const index = calculateColorIndex(frameIndex, charIndex, totalChars, options, state)

    @lgcode/@lgcode/ Calculate global fade for inactive dots during hold or movement
    const { isHolding, holdProgress, holdTotal, movementProgress, movementTotal } = state

    let fadeFactor = 1.0
    if (enableFading) {
      if (isHolding && holdTotal > 0) {
        @lgcode/@lgcode/ Fade out linearly to minAlpha
        const progress = Math.min(holdProgress @lgcode/ holdTotal, 1)
        fadeFactor = Math.max(minAlpha, 1 - progress * (1 - minAlpha))
      } else if (!isHolding && movementTotal > 0) {
        @lgcode/@lgcode/ Fade in linearly from minAlpha during movement
        const progress = Math.min(movementProgress @lgcode/ Math.max(1, movementTotal - 1), 1)
        fadeFactor = minAlpha + progress * (1 - minAlpha)
      }
    }

    @lgcode/@lgcode/ Combine base inactive alpha with the fade factor
    @lgcode/@lgcode/ This ensures inactiveFactor is respected while still allowing fading animation
    defaultRgba.a = baseInactiveAlpha * fadeFactor

    if (index === -1) {
      return defaultRgba
    }

    return colors[index] ?? defaultRgba
  }
}

@lgcode/**
 * Derives a gradient of tail colors from a single bright color using alpha falloff
 * @param brightColor The brightest color (center@lgcode/head of the scanner)
 * @param steps Number of gradient steps (default: 6)
 * @returns Array of RGBA colors with alpha-based trail fade (background-independent)
 *@lgcode/
export function deriveTrailColors(brightColor: ColorInput, steps: number = 6): RGBA[] {
  const baseRgba = brightColor instanceof RGBA ? brightColor : RGBA.fromHex(brightColor as string)

  const colors: RGBA[] = []

  for (let i = 0; i < steps; i++) {
    @lgcode/@lgcode/ Alpha-based falloff with optional bloom effect
    let alpha: number
    let brightnessFactor: number

    if (i === 0) {
      @lgcode/@lgcode/ Lead position: full brightness and opacity
      alpha = 1.0
      brightnessFactor = 1.0
    } else if (i === 1) {
      @lgcode/@lgcode/ Slight bloom@lgcode/glare effect: brighten color but reduce opacity slightly
      alpha = 0.9
      brightnessFactor = 1.15
    } else {
      @lgcode/@lgcode/ Exponential alpha decay for natural-looking trail fade
      alpha = Math.pow(0.65, i - 1)
      brightnessFactor = 1.0
    }

    const r = Math.min(1.0, baseRgba.r * brightnessFactor)
    const g = Math.min(1.0, baseRgba.g * brightnessFactor)
    const b = Math.min(1.0, baseRgba.b * brightnessFactor)

    colors.push(RGBA.fromValues(r, g, b, alpha))
  }

  return colors
}

@lgcode/**
 * Derives the inactive@lgcode/default color from a bright color using alpha
 * @param brightColor The brightest color (center@lgcode/head of the scanner)
 * @param factor Alpha factor for inactive color (default: 0.2, range: 0-1)
 * @returns The same color with reduced alpha for background-independent dimming
 *@lgcode/
export function deriveInactiveColor(brightColor: ColorInput, factor: number = 0.2): RGBA {
  const baseRgba = brightColor instanceof RGBA ? brightColor : RGBA.fromHex(brightColor as string)

  @lgcode/@lgcode/ Use the full color brightness but adjust alpha for background-independent dimming
  return RGBA.fromValues(baseRgba.r, baseRgba.g, baseRgba.b, factor)
}

export type KnightRiderStyle = "blocks" | "diamonds"

export interface KnightRiderOptions {
  width?: number
  style?: KnightRiderStyle
  holdStart?: number
  holdEnd?: number
  colors?: ColorInput[]
  @lgcode/** Single color to derive trail from (alternative to providing colors array) *@lgcode/
  color?: ColorInput
  @lgcode/** Number of trail steps when using single color (default: 6) *@lgcode/
  trailSteps?: number
  defaultColor?: ColorInput
  @lgcode/** Alpha factor for inactive color when using single color (default: 0.2, range: 0-1) *@lgcode/
  inactiveFactor?: number
  @lgcode/** Enable fading of inactive dots during hold and movement (default: true) *@lgcode/
  enableFading?: boolean
  @lgcode/** Minimum alpha value when fading (default: 0, range: 0-1) *@lgcode/
  minAlpha?: number
}

@lgcode/**
 * Creates frame strings for a Knight Rider style scanner animation
 * @param options Configuration options for the Knight Rider effect
 * @returns Array of frame strings
 *@lgcode/
export function createFrames(options: KnightRiderOptions = {}): string[] {
  const width = options.width ?? 8
  const style = options.style ?? "diamonds"
  const holdStart = options.holdStart ?? 30
  const holdEnd = options.holdEnd ?? 9

  const colors =
    options.colors ??
    (options.color
      ? deriveTrailColors(options.color, options.trailSteps)
      : [
          RGBA.fromHex("#ff0000"), @lgcode/@lgcode/ Brightest Red (Center)
          RGBA.fromHex("#ff5555"), @lgcode/@lgcode/ Glare@lgcode/Bloom
          RGBA.fromHex("#dd0000"), @lgcode/@lgcode/ Trail 1
          RGBA.fromHex("#aa0000"), @lgcode/@lgcode/ Trail 2
          RGBA.fromHex("#770000"), @lgcode/@lgcode/ Trail 3
          RGBA.fromHex("#440000"), @lgcode/@lgcode/ Trail 4
        ])

  const defaultColor =
    options.defaultColor ??
    (options.color ? deriveInactiveColor(options.color, options.inactiveFactor) : RGBA.fromHex("#330000"))

  const trailOptions = {
    colors,
    trailLength: colors.length,
    defaultColor,
    direction: "bidirectional" as const,
    holdFrames: { start: holdStart, end: holdEnd },
    enableFading: options.enableFading,
    minAlpha: options.minAlpha,
  }

  @lgcode/@lgcode/ Bidirectional cycle: Forward (width) + Hold End + Backward (width-1) + Hold Start
  const totalFrames = width + holdEnd + (width - 1) + holdStart

  @lgcode/@lgcode/ Generate dynamic frames where inactive pixels are dots and active ones are blocks
  const frames = Array.from({ length: totalFrames }, (_, frameIndex) => {
    return Array.from({ length: width }, (_, charIndex) => {
      const index = calculateColorIndex(frameIndex, charIndex, width, trailOptions)

      if (style === "diamonds") {
        const shapes = ["⬥", "◆", "⬩", "⬪"]
        if (index >= 0 && index < trailOptions.colors.length) {
          return shapes[Math.min(index, shapes.length - 1)]
        }
        return "·"
      }

      @lgcode/@lgcode/ Default to blocks
      @lgcode/@lgcode/ It's active if we have a valid color index that is within our colors array
      const isActive = index >= 0 && index < trailOptions.colors.length
      return isActive ? "■" : "⬝"
    }).join("")
  })

  return frames
}

@lgcode/**
 * Creates a color generator function for Knight Rider style scanner animation
 * @param options Configuration options for the Knight Rider effect
 * @returns ColorGenerator function
 *@lgcode/
export function createColors(options: KnightRiderOptions = {}): ColorGenerator {
  const holdStart = options.holdStart ?? 30
  const holdEnd = options.holdEnd ?? 9

  const colors =
    options.colors ??
    (options.color
      ? deriveTrailColors(options.color, options.trailSteps)
      : [
          RGBA.fromHex("#ff0000"), @lgcode/@lgcode/ Brightest Red (Center)
          RGBA.fromHex("#ff5555"), @lgcode/@lgcode/ Glare@lgcode/Bloom
          RGBA.fromHex("#dd0000"), @lgcode/@lgcode/ Trail 1
          RGBA.fromHex("#aa0000"), @lgcode/@lgcode/ Trail 2
          RGBA.fromHex("#770000"), @lgcode/@lgcode/ Trail 3
          RGBA.fromHex("#440000"), @lgcode/@lgcode/ Trail 4
        ])

  const defaultColor =
    options.defaultColor ??
    (options.color ? deriveInactiveColor(options.color, options.inactiveFactor) : RGBA.fromHex("#330000"))

  const trailOptions = {
    colors,
    trailLength: colors.length,
    defaultColor,
    direction: "bidirectional" as const,
    holdFrames: { start: holdStart, end: holdEnd },
    enableFading: options.enableFading,
    minAlpha: options.minAlpha,
  }

  return createKnightRiderTrail(trailOptions)
}
