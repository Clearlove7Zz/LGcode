declare module "*.mp3" {
  const path: string
  export default path
}

declare module "@lgcode/ui@lgcode/audio@lgcode/*.mp3" {
  const path: string
  export default path
}
