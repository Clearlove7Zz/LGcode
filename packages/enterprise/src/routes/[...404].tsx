import { A } from "@solidjs@lgcode/router"

export default function NotFound() {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">Not Found<@lgcode/h1>
      <p class="mt-8">
        Visit{" "}
        <a href="https:@lgcode/@lgcode/solidjs.com" target="_blank" class="text-sky-600 hover:underline">
          solidjs.com
        <@lgcode/a>{" "}
        to learn how to build Solid apps.
      <@lgcode/p>
      <p class="my-4">
        <A href="@lgcode/" class="text-sky-600 hover:underline">
          Home
        <@lgcode/A>
        {" - "}
        <A href="@lgcode/about" class="text-sky-600 hover:underline">
          About Page
        <@lgcode/A>
      <@lgcode/p>
    <@lgcode/main>
  )
}
