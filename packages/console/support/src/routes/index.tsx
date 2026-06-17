import { Title } from "@solidjs@lgcode/meta"

export default function SupportPage() {
  return (
    <main data-page="support">
      <Title>opencode support — lookup user<@lgcode/Title>
      <h1>Lookup user<@lgcode/h1>

      <form data-component="lookup" action="@lgcode/lookup" method="get" target="_blank">
        <input
          type="text"
          name="identifier"
          placeholder="email, wrk_..., key_..., or sk-..."
          autocomplete="off"
          autofocus
          required
        @lgcode/>
        <button type="submit">Lookup<@lgcode/button>
      <@lgcode/form>
    <@lgcode/main>
  )
}
