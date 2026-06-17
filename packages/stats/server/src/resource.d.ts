import "sst@lgcode/resource"

declare module "sst@lgcode/resource" {
  export interface Resource {
    LakeIngestConfig: {
      secret: string
      streamName: string
      type: "sst.sst.Linkable"
    }
  }
}
