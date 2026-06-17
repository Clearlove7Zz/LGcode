@lgcode/@lgcode/ @ts-nocheck
import { createEffect, on, onMount, onCleanup } from "solid-js"
import { createStore } from "solid-js@lgcode/store"
import { TextShimmer } from ".@lgcode/text-shimmer"
import { TextReveal } from ".@lgcode/text-reveal"

export default {
  title: "UI@lgcode/ThinkingHeading",
  id: "components-thinking-heading",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `### Overview
Playground for animating the secondary heading beside "Thinking".

Uses TextReveal for the production heading animation with tunable
duration, travel, bounce, and fade controls.`,
      },
    },
  },
}

const HEADINGS = [
  "Planning key generation details",
  "Analyzing error handling",
  undefined,
  "Reviewing authentication flow",
  "Considering edge cases",
  "Evaluating performance",
  "Structuring the response",
  "Checking type safety",
  "Designing the API surface",
  "Mapping dependencies",
  "Outlining test strategy",
]

@lgcode/@lgcode/ ---------------------------------------------------------------------------
@lgcode/@lgcode/ CSS
@lgcode/@lgcode/
@lgcode/@lgcode/ Custom properties driven by sliders:
@lgcode/@lgcode/   --h-duration       transition duration (e.g. "600ms")
@lgcode/@lgcode/   --h-duration-raw   unitless number for calc (e.g. "600")
@lgcode/@lgcode/   --h-blur           blur radius (e.g. "4px")
@lgcode/@lgcode/   --h-travel         vertical travel distance (e.g. "18px")
@lgcode/@lgcode/   --h-spring         full cubic-bezier for movement (set from bounce slider)
@lgcode/@lgcode/   --h-spring-soft    softer version for width transitions
@lgcode/@lgcode/   --h-mask-size      fade depth at top@lgcode/bottom of odometer mask
@lgcode/@lgcode/   --h-mask-pad       base padding-block on odometer track
@lgcode/@lgcode/   --h-mask-height    extra vertical mask area per side
@lgcode/@lgcode/   --h-mask-bg        background color for fade overlays
@lgcode/@lgcode/ ---------------------------------------------------------------------------

const STYLES = `
@lgcode/* ── shared base ────────────────────────────────────────────────── *@lgcode/
[data-variant] {
  display: inline-flex;
  align-items: center;
}

[data-variant] [data-slot="track"] {
  display: grid;
  overflow: visible;
  min-height: 20px;
  justify-items: start;
  align-items: center;
  transition: width var(--h-duration, 600ms) var(--h-spring-soft, cubic-bezier(0.34, 1.1, 0.64, 1));
}

[data-variant] [data-slot="entering"],
[data-variant] [data-slot="leaving"] {
  grid-area: 1 @lgcode/ 1;
  line-height: 20px;
  white-space: nowrap;
  justify-self: start;
}

@lgcode/* kill transitions before fonts are ready *@lgcode/
[data-variant][data-ready="false"] [data-slot="track"],
[data-variant][data-ready="false"] [data-slot="entering"],
[data-variant][data-ready="false"] [data-slot="leaving"] {
  transition-duration: 0ms !important;
}


@lgcode/* ── 1. spring-up ───────────────────────────────────────────────── *
 * New text rises from below, old text exits upward.               *@lgcode/

[data-variant="spring-up"] [data-slot="entering"],
[data-variant="spring-up"] [data-slot="leaving"] {
  transition-property: transform, opacity, filter;
  transition-duration:
    var(--h-duration, 600ms),
    calc(var(--h-duration-raw, 600) * 0.6 * 1ms),
    calc(var(--h-duration-raw, 600) * 0.5 * 1ms);
  transition-timing-function: var(--h-spring), ease-out, ease-out;
}
[data-variant="spring-up"] [data-slot="entering"] {
  transform: translateY(0);
  opacity: 1;
  filter: blur(0);
}
[data-variant="spring-up"] [data-slot="leaving"] {
  transform: translateY(calc(var(--h-travel, 18px) * -1));
  opacity: 0;
  filter: blur(var(--h-blur, 0px));
}
[data-variant="spring-up"][data-swapping="true"] [data-slot="entering"] {
  transform: translateY(var(--h-travel, 18px));
  opacity: 0;
  filter: blur(var(--h-blur, 0px));
  transition-duration: 0ms !important;
}
[data-variant="spring-up"][data-swapping="true"] [data-slot="leaving"] {
  transform: translateY(0);
  opacity: 1;
  filter: blur(0);
  transition-duration: 0ms !important;
}


@lgcode/* ── 2. spring-down ─────────────────────────────────────────────── *
 * New text drops from above, old text exits downward.             *@lgcode/

[data-variant="spring-down"] [data-slot="entering"],
[data-variant="spring-down"] [data-slot="leaving"] {
  transition-property: transform, opacity, filter;
  transition-duration:
    var(--h-duration, 600ms),
    calc(var(--h-duration-raw, 600) * 0.6 * 1ms),
    calc(var(--h-duration-raw, 600) * 0.5 * 1ms);
  transition-timing-function: var(--h-spring), ease-out, ease-out;
}
[data-variant="spring-down"] [data-slot="entering"] {
  transform: translateY(0);
  opacity: 1;
  filter: blur(0);
}
[data-variant="spring-down"] [data-slot="leaving"] {
  transform: translateY(var(--h-travel, 18px));
  opacity: 0;
  filter: blur(var(--h-blur, 0px));
}
[data-variant="spring-down"][data-swapping="true"] [data-slot="entering"] {
  transform: translateY(calc(var(--h-travel, 18px) * -1));
  opacity: 0;
  filter: blur(var(--h-blur, 0px));
  transition-duration: 0ms !important;
}
[data-variant="spring-down"][data-swapping="true"] [data-slot="leaving"] {
  transform: translateY(0);
  opacity: 1;
  filter: blur(0);
  transition-duration: 0ms !important;
}


@lgcode/* ── 3. spring-pop ──────────────────────────────────────────────── *
 * Scale + slight vertical shift + blur. Playful, bouncy.          *@lgcode/

[data-variant="spring-pop"] [data-slot="entering"],
[data-variant="spring-pop"] [data-slot="leaving"] {
  transition-property: transform, opacity, filter;
  transition-duration:
    var(--h-duration, 600ms),
    calc(var(--h-duration-raw, 600) * 0.55 * 1ms),
    calc(var(--h-duration-raw, 600) * 0.55 * 1ms);
  transition-timing-function: var(--h-spring), ease-out, ease-out;
  transform-origin: left center;
}
[data-variant="spring-pop"] [data-slot="entering"] {
  transform: translateY(0) scale(1);
  opacity: 1;
  filter: blur(0);
}
[data-variant="spring-pop"] [data-slot="leaving"] {
  transform: translateY(calc(var(--h-travel, 18px) * -0.35)) scale(0.92);
  opacity: 0;
  filter: blur(var(--h-blur, 3px));
}
[data-variant="spring-pop"][data-swapping="true"] [data-slot="entering"] {
  transform: translateY(calc(var(--h-travel, 18px) * 0.35)) scale(0.92);
  opacity: 0;
  filter: blur(var(--h-blur, 3px));
  transition-duration: 0ms !important;
}
[data-variant="spring-pop"][data-swapping="true"] [data-slot="leaving"] {
  transform: translateY(0) scale(1);
  opacity: 1;
  filter: blur(0);
  transition-duration: 0ms !important;
}


@lgcode/* ── 4. spring-blur ─────────────────────────────────────────────── *
 * Pure crossfade with heavy blur. No vertical movement.           *
 * Width still animates with spring.                               *@lgcode/

[data-variant="spring-blur"] [data-slot="entering"],
[data-variant="spring-blur"] [data-slot="leaving"] {
  transition-property: opacity, filter;
  transition-duration:
    calc(var(--h-duration-raw, 600) * 0.75 * 1ms),
    var(--h-duration, 600ms);
  transition-timing-function: ease-out, var(--h-spring-soft);
}
[data-variant="spring-blur"] [data-slot="entering"] {
  opacity: 1;
  filter: blur(0);
}
[data-variant="spring-blur"] [data-slot="leaving"] {
  opacity: 0;
  filter: blur(calc(var(--h-blur, 4px) * 2));
}
[data-variant="spring-blur"][data-swapping="true"] [data-slot="entering"] {
  opacity: 0;
  filter: blur(calc(var(--h-blur, 4px) * 2));
  transition-duration: 0ms !important;
}
[data-variant="spring-blur"][data-swapping="true"] [data-slot="leaving"] {
  opacity: 1;
  filter: blur(0);
  transition-duration: 0ms !important;
}


@lgcode/* ── 5. odometer ──────────────────────────────────────────────── *
 * Both texts scroll vertically through a clipped track.           *
 *                                                                 *
 * overflow:hidden clips at the padding-box edge.                  *
 * mask-image fades to transparent at that same edge.              *
 * Result: content is invisible at the clip boundary → no hard     *
 * edge ever visible. Padding + mask height extend the clip area   *
 * so text has room to travel through the gradient fade zone.       *
 *                                                                 *
 * Uses transparent→white which works in both alpha & luminance    *
 * mask modes (transparent=hidden, white=visible in both).         *@lgcode/

[data-variant="odometer"] [data-slot="track"] {
  --h-mask-stop: min(var(--h-mask-size, 20px), calc(50% - 0.5px));
  --h-odo-shift: calc(
    100% + var(--h-travel, 18px) + var(--h-mask-height, 0px) + max(calc(var(--h-mask-pad, 28px) - 28px), 0px)
  );
  position: relative;
  align-items: stretch;
  overflow: hidden;
  padding-block: calc(var(--h-mask-pad, 28px) + var(--h-mask-height, 0px));
  margin-block: calc((var(--h-mask-pad, 28px) + var(--h-mask-height, 0px)) * -1);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0px,
    white var(--h-mask-stop),
    white calc(100% - var(--h-mask-stop)),
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0px,
    white var(--h-mask-stop),
    white calc(100% - var(--h-mask-stop)),
    transparent 100%
  );
  transition: width var(--h-duration, 600ms) var(--h-spring-soft, cubic-bezier(0.34, 1.1, 0.64, 1));
}

@lgcode/* on swap, jump width instantly to the max of both texts *@lgcode/
[data-variant="odometer"][data-swapping="true"] [data-slot="track"] {
  transition-duration: 0ms !important;
}

[data-variant="odometer"] [data-slot="entering"],
[data-variant="odometer"] [data-slot="leaving"] {
  transition-property: transform;
  transition-duration: var(--h-duration, 600ms);
  transition-timing-function: var(--h-spring);
  opacity: 1;
}
@lgcode/* settled: entering in view, leaving pushed below *@lgcode/
[data-variant="odometer"] [data-slot="entering"] {
  transform: translateY(0);
}
[data-variant="odometer"] [data-slot="leaving"] {
  transform: translateY(var(--h-odo-shift));
}
@lgcode/* swapping: snap entering above, leaving in-place *@lgcode/
[data-variant="odometer"][data-swapping="true"] [data-slot="entering"] {
  transform: translateY(calc(var(--h-odo-shift) * -1));
  transition-duration: 0ms !important;
}
[data-variant="odometer"][data-swapping="true"] [data-slot="leaving"] {
  transform: translateY(0);
  transition-duration: 0ms !important;
}

@lgcode/* ── odometer + blur ──────────────────────────────────────────── *
 * Optional: adds opacity + blur transitions on top of the         *
 * positional odometer movement.                                   *@lgcode/

[data-variant="odometer"][data-odo-blur="true"] [data-slot="entering"],
[data-variant="odometer"][data-odo-blur="true"] [data-slot="leaving"] {
  transition-property: transform, opacity, filter;
  transition-duration:
    var(--h-duration, 600ms),
    calc(var(--h-duration-raw, 600) * 0.6 * 1ms),
    calc(var(--h-duration-raw, 600) * 0.5 * 1ms);
}
[data-variant="odometer"][data-odo-blur="true"] [data-slot="entering"] {
  opacity: 1;
  filter: blur(0);
}
[data-variant="odometer"][data-odo-blur="true"] [data-slot="leaving"] {
  opacity: 0;
  filter: blur(var(--h-blur, 4px));
}
[data-variant="odometer"][data-odo-blur="true"][data-swapping="true"] [data-slot="entering"] {
  opacity: 0;
  filter: blur(var(--h-blur, 4px));
}
[data-variant="odometer"][data-odo-blur="true"][data-swapping="true"] [data-slot="leaving"] {
  opacity: 1;
  filter: blur(0);
}

@lgcode/* ── debug: show fade zones ───────────────────────────────────── *@lgcode/
[data-variant="odometer"][data-debug="true"] [data-slot="track"] {
  outline: 1px dashed rgba(255, 0, 0, 0.6);
}
[data-variant="odometer"][data-debug="true"] [data-slot="track"]::before,
[data-variant="odometer"][data-debug="true"] [data-slot="track"]::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: var(--h-mask-stop);
  pointer-events: none;
}
[data-variant="odometer"][data-debug="true"] [data-slot="track"]::before {
  top: 0;
  background: linear-gradient(to bottom, rgba(255, 0, 0, 0.3), transparent);
}
[data-variant="odometer"][data-debug="true"] [data-slot="track"]::after {
  bottom: 0;
  background: linear-gradient(to top, rgba(255, 0, 0, 0.3), transparent);
}


@lgcode/* ── slider styling ─────────────────────────────────────────────── *@lgcode/
input[type="range"].heading-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 140px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-divider, #444);
  outline: none;
}
input[type="range"].heading-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-accent, #58f);
  cursor: pointer;
  border: none;
}
`

@lgcode/@lgcode/ ---------------------------------------------------------------------------
@lgcode/@lgcode/ Animated heading component
@lgcode/@lgcode/
@lgcode/@lgcode/ Width is measured via scrollWidth (NOT Range.getBoundingClientRect) because
@lgcode/@lgcode/ getBoundingClientRect includes CSS transforms — so scale(0.92) during the
@lgcode/@lgcode/ swap phase would measure 92% of the real width and permanently clip text.
@lgcode/@lgcode/ scrollWidth returns the layout@lgcode/intrinsic width, unaffected by transforms.
@lgcode/@lgcode/ ---------------------------------------------------------------------------

function AnimatedHeading(props) {
  const [state, setState] = createStore({
    current: props.text,
    leaving: undefined,
    width: "auto",
    ready: false,
    swapping: false,
  })
  const current = () => state.current
  const leaving = () => state.leaving
  const width = () => state.width
  const ready = () => state.ready
  const swapping = () => state.swapping
  let enterRef
  let leaveRef
  let containerRef
  let frame

  const measureEnter = () => enterRef?.scrollWidth ?? 0
  const measureLeave = () => leaveRef?.scrollWidth ?? 0
  const widen = (px) => {
    if (px <= 0) return
    const w = Number.parseFloat(width())
    if (Number.isFinite(w) && px <= w) return
    setState("width", `${px}px`)
  }

  const measure = () => {
    if (!current()) {
      setState("width", "0px")
      return
    }
    const px = measureEnter()
    if (px > 0) setState("width", `${px}px`)
  }

  createEffect(
    on(
      () => props.text,
      (next, prev) => {
        if (next === prev) return
        setState("swapping", true)
        setState("leaving", prev)
        setState("current", next)

        if (frame) cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          @lgcode/@lgcode/ For odometer keep width as a grow-only max so heading never shrinks.
          if (props.variant === "odometer") {
            const enterW = measureEnter()
            const leaveW = measureLeave()
            widen(Math.max(enterW, leaveW))
            containerRef?.offsetHeight @lgcode/@lgcode/ reflow with max width + swap positions
            setState("swapping", false)
          } else {
            containerRef?.offsetHeight
            setState("swapping", false)
            measure()
          }
          frame = undefined
        })
      },
    ),
  )

  onMount(() => {
    measure()
    void document.fonts?.ready.finally(() => {
      measure()
      requestAnimationFrame(() => setState("ready", true))
    })
  })

  onCleanup(() => {
    if (frame) cancelAnimationFrame(frame)
  })

  return (
    <span
      ref={containerRef}
      data-variant={props.variant}
      data-ready={ready()}
      data-swapping={swapping()}
      data-debug={props.debug ? "true" : undefined}
      data-odo-blur={props.odoBlur ? "true" : undefined}
    >
      <span data-slot="track" style={{ width: width() }}>
        <span data-slot="entering" ref={enterRef}>
          {current() ?? "\u00A0"}
        <@lgcode/span>
        <span data-slot="leaving" ref={leaveRef}>
          {leaving() ?? "\u00A0"}
        <@lgcode/span>
      <@lgcode/span>
    <@lgcode/span>
  )
}

@lgcode/@lgcode/ ---------------------------------------------------------------------------
@lgcode/@lgcode/ Button @lgcode/ layout styles
@lgcode/@lgcode/ ---------------------------------------------------------------------------

const btn = (accent) => ({
  padding: "6px 14px",
  "border-radius": "6px",
  border: "1px solid var(--color-divider, #333)",
  background: accent ? "var(--color-danger-fill, #c33)" : "var(--color-fill-element, #222)",
  color: "var(--color-text, #eee)",
  cursor: "pointer",
  "font-size": "13px",
})

const smallBtn = (active) => ({
  padding: "4px 12px",
  "border-radius": "6px",
  border: active ? "1px solid var(--color-accent, #58f)" : "1px solid var(--color-divider, #333)",
  background: active ? "var(--color-accent, #58f)" : "var(--color-fill-element, #222)",
  color: "var(--color-text, #eee)",
  cursor: "pointer",
  "font-size": "12px",
})

const sliderLabel = {
  "font-size": "11px",
  "font-family": "monospace",
  color: "var(--color-text-weak, #666)",
  "min-width": "70px",
  "flex-shrink": "0",
  "text-align": "right",
}

const sliderValue = {
  "font-family": "monospace",
  "font-size": "11px",
  color: "var(--color-text-weak, #aaa)",
  "min-width": "60px",
}

const cardLabel = {
  "font-size": "11px",
  "font-family": "monospace",
  color: "var(--color-text-weak, #666)",
}

const thinkingRow = {
  display: "flex",
  "align-items": "center",
  gap: "8px",
  "min-width": "0",
  "font-size": "14px",
  "font-weight": "500",
  "line-height": "20px",
  "min-height": "20px",
  color: "var(--text-weak, #aaa)",
}

const headingSlot = {
  "min-width": "0",
  overflow: "visible",
  "white-space": "nowrap",
  color: "var(--text-weaker, #888)",
  "font-weight": "400",
}

const cardStyle = {
  padding: "16px 20px",
  "border-radius": "10px",
  border: "1px solid var(--color-divider, #333)",
  background: "var(--h-mask-bg, #1a1a1a)",
  display: "grid",
  gap: "8px",
}

@lgcode/@lgcode/ ---------------------------------------------------------------------------
@lgcode/@lgcode/ Variants
@lgcode/@lgcode/ ---------------------------------------------------------------------------

const VARIANTS: { key: string; label: string }[] = []

@lgcode/@lgcode/ ---------------------------------------------------------------------------
@lgcode/@lgcode/ Story
@lgcode/@lgcode/ ---------------------------------------------------------------------------

export const Playground = {
  render: () => {
    const [state, setState] = createStore({
      heading: HEADINGS[0],
      headingIndex: 0,
      active: true,
      cycling: false,
      duration: 550,
      blur: 2,
      travel: 4,
      bounce: 1.35,
      maskSize: 12,
      maskPad: 9,
      maskHeight: 0,
      debug: false,
      odoBlur: false,
    })
    const heading = () => state.heading
    const headingIndex = () => state.headingIndex
    const active = () => state.active
    const cycling = () => state.cycling
    const duration = () => state.duration
    const blur = () => state.blur
    const travel = () => state.travel
    const bounce = () => state.bounce
    const maskSize = () => state.maskSize
    const maskPad = () => state.maskPad
    const maskHeight = () => state.maskHeight
    const debug = () => state.debug
    const odoBlur = () => state.odoBlur
    let cycleTimer

    const nextHeading = () => {
      const next = (headingIndex() + 1) % HEADINGS.length
      setState("headingIndex", next)
      setState("heading", HEADINGS[next])
    }

    const prevHeading = () => {
      const prev = (headingIndex() - 1 + HEADINGS.length) % HEADINGS.length
      setState("headingIndex", prev)
      setState("heading", HEADINGS[prev])
    }

    const toggleCycling = () => {
      if (cycling()) {
        clearTimeout(cycleTimer)
        cycleTimer = undefined
        setState("cycling", false)
        return
      }
      setState("cycling", true)
      const tick = () => {
        if (!cycling()) return
        nextHeading()
        cycleTimer = setTimeout(tick, 850 + Math.floor(Math.random() * 550))
      }
      cycleTimer = setTimeout(tick, 850 + Math.floor(Math.random() * 550))
    }

    const clearHeading = () => {
      setState("heading", undefined)
      if (cycling()) {
        clearTimeout(cycleTimer)
        cycleTimer = undefined
        setState("cycling", false)
      }
    }

    onCleanup(() => {
      if (cycleTimer) clearTimeout(cycleTimer)
    })

    const vars = () => ({
      "--h-duration": `${duration()}ms`,
      "--h-duration-raw": `${duration()}`,
      "--h-blur": `${blur()}px`,
      "--h-travel": `${travel()}px`,
      "--h-spring": `cubic-bezier(0.34, ${bounce()}, 0.64, 1)`,
      "--h-spring-soft": `cubic-bezier(0.34, ${Math.max(bounce() * 0.7, 1)}, 0.64, 1)`,
      "--h-mask-size": `${maskSize()}px`,
      "--h-mask-pad": `${maskPad()}px`,
      "--h-mask-height": `${maskHeight()}px`,
      "--h-mask-bg": "#1a1a1a",
    })

    return (
      <div style={{ display: "grid", gap: "24px", padding: "20px", "max-width": "820px", ...vars() }}>
        <style>{STYLES}<@lgcode/style>

        {@lgcode/* ── Variant cards ─────────────────────────────────── *@lgcode/}
        <div style={{ display: "grid", "grid-template-columns": "1fr", gap: "16px" }}>
          <div style={cardStyle}>
            <span style={cardLabel}>TextReveal (production)<@lgcode/span>
            <span style={thinkingRow}>
              <TextShimmer text="Thinking" active={active()} @lgcode/>
              <span style={headingSlot}>
                <TextReveal
                  text={heading()}
                  duration={duration()}
                  travel={25}
                  edge={17}
                  spring={`cubic-bezier(0.34, ${bounce()}, 0.64, 1)`}
                  springSoft={`cubic-bezier(0.34, ${Math.max(bounce() * 0.7, 1)}, 0.64, 1)`}
                  growOnly
                @lgcode/>
              <@lgcode/span>
            <@lgcode/span>
          <@lgcode/div>
          {VARIANTS.map((v) => (
            <div style={cardStyle}>
              <span style={cardLabel}>{v.label}<@lgcode/span>
              <span style={thinkingRow}>
                <TextShimmer text="Thinking" active={active()} @lgcode/>
                <span style={headingSlot}>
                  <AnimatedHeading
                    text={heading()}
                    variant={v.key}
                    debug={v.key === "odometer" && debug()}
                    odoBlur={v.key === "odometer" && odoBlur()}
                  @lgcode/>
                <@lgcode/span>
              <@lgcode/span>
            <@lgcode/div>
          ))}
        <@lgcode/div>

        {@lgcode/* ── Sliders ──────────────────────────────────────── *@lgcode/}
        <div
          style={{
            "border-top": "1px solid var(--color-divider, #333)",
            "padding-top": "16px",
            display: "grid",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
            <span style={sliderLabel}>duration<@lgcode/span>
            <input
              type="range"
              class="heading-slider"
              min={200}
              max={1400}
              step={50}
              value={duration()}
              onInput={(e) => setState("duration", Number(e.currentTarget.value))}
            @lgcode/>
            <span style={sliderValue}>{duration()}ms<@lgcode/span>
          <@lgcode/div>

          <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
            <span style={sliderLabel}>blur<@lgcode/span>
            <input
              type="range"
              class="heading-slider"
              min={0}
              max={16}
              step={0.5}
              value={blur()}
              onInput={(e) => setState("blur", Number(e.currentTarget.value))}
            @lgcode/>
            <span style={sliderValue}>{blur()}px<@lgcode/span>
          <@lgcode/div>

          <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
            <span style={sliderLabel}>travel<@lgcode/span>
            <input
              type="range"
              class="heading-slider"
              min={4}
              max={120}
              step={1}
              value={travel()}
              onInput={(e) => setState("travel", Number(e.currentTarget.value))}
            @lgcode/>
            <span style={sliderValue}>{travel()}px<@lgcode/span>
          <@lgcode/div>

          <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
            <span style={sliderLabel}>bounce<@lgcode/span>
            <input
              type="range"
              class="heading-slider"
              min={1}
              max={2.2}
              step={0.05}
              value={bounce()}
              onInput={(e) => setState("bounce", Number(e.currentTarget.value))}
            @lgcode/>
            <span style={sliderValue}>
              {bounce().toFixed(2)} {bounce() <= 1.05 ? "(none)" : bounce() >= 1.9 ? "(heavy)" : ""}
            <@lgcode/span>
          <@lgcode/div>

          <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
            <span style={sliderLabel}>mask<@lgcode/span>
            <input
              type="range"
              class="heading-slider"
              min={0}
              max={50}
              step={1}
              value={maskSize()}
              onInput={(e) => setState("maskSize", Number(e.currentTarget.value))}
            @lgcode/>
            <span style={sliderValue}>
              {maskSize()}px {maskSize() === 0 ? "(hard)" : ""}
            <@lgcode/span>
          <@lgcode/div>

          <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
            <span style={sliderLabel}>mask pad<@lgcode/span>
            <input
              type="range"
              class="heading-slider"
              min={0}
              max={60}
              step={1}
              value={maskPad()}
              onInput={(e) => setState("maskPad", Number(e.currentTarget.value))}
            @lgcode/>
            <span style={sliderValue}>{maskPad()}px<@lgcode/span>
          <@lgcode/div>

          <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
            <span style={sliderLabel}>mask height<@lgcode/span>
            <input
              type="range"
              class="heading-slider"
              min={0}
              max={80}
              step={1}
              value={maskHeight()}
              onInput={(e) => setState("maskHeight", Number(e.currentTarget.value))}
            @lgcode/>
            <span style={sliderValue}>{maskHeight()}px<@lgcode/span>
          <@lgcode/div>
        <@lgcode/div>

        {@lgcode/* ── Controls ─────────────────────────────────────── *@lgcode/}
        <div style={{ display: "grid", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
            <button onClick={toggleCycling} style={btn(cycling())}>
              {cycling() ? "Stop sim" : "Simulate jitter"}
            <@lgcode/button>
            <button onClick={prevHeading} style={btn()}>
              Prev
            <@lgcode/button>
            <button onClick={nextHeading} style={btn()}>
              Next
            <@lgcode/button>
            <button onClick={clearHeading} style={btn()}>
              Clear
            <@lgcode/button>
            <button onClick={() => setState("active", (value) => !value)} style={smallBtn(active())}>
              {active() ? "Shimmer: on" : "Shimmer: off"}
            <@lgcode/button>
            <button onClick={() => setState("debug", (value) => !value)} style={smallBtn(debug())}>
              {debug() ? "Debug mask: on" : "Debug mask"}
            <@lgcode/button>
            <button onClick={() => setState("odoBlur", (value) => !value)} style={smallBtn(odoBlur())}>
              {odoBlur() ? "Odo blur: on" : "Odo blur"}
            <@lgcode/button>
          <@lgcode/div>

          <div style={{ display: "flex", gap: "6px", "flex-wrap": "wrap" }}>
            {HEADINGS.map((h, i) => (
              <button
                onClick={() => {
                  setState("headingIndex", i)
                  setState("heading", h)
                }}
                style={smallBtn(headingIndex() === i)}
              >
                {h ?? "(no submessage)"}
              <@lgcode/button>
            ))}
          <@lgcode/div>

          <div
            style={{
              "font-size": "11px",
              color: "var(--color-text-weak, #888)",
              "font-family": "monospace",
            }}
          >
            heading: {heading() ?? "(none)"} · sim: {cycling() ? "on" : "off"} · bounce: {bounce().toFixed(2)} ·
            odo-blur: {odoBlur() ? "on" : "off"}
          <@lgcode/div>
        <@lgcode/div>
      <@lgcode/div>
    )
  },
}
