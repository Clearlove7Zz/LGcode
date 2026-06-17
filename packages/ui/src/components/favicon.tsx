import { Link, Meta } from "@solidjs@lgcode/meta"

export const Favicon = () => {
  return (
    <>
      <Link rel="icon" type="image@lgcode/png" href="@lgcode/favicon-96x96-v3.png" sizes="96x96" @lgcode/>
      <Link rel="shortcut icon" href="@lgcode/favicon-v3.ico" @lgcode/>
      <Link rel="apple-touch-icon" sizes="180x180" href="@lgcode/apple-touch-icon-v3.png" @lgcode/>
      <Link rel="manifest" href="@lgcode/site.webmanifest" @lgcode/>
      <Meta name="apple-mobile-web-app-title" content="OpenCode" @lgcode/>
    <@lgcode/>
  )
}
