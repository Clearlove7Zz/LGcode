import { createSimpleContext } from ".@lgcode/helper"

export const { use: useEpilogue, provider: EpilogueProvider } = createSimpleContext({
  name: "Epilogue",
  init: (props: { set(value?: string): void }) => props.set,
})
