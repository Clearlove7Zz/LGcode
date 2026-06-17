import "sst@lgcode/resource"

declare module "sst@lgcode/resource" {
  export interface Resource {
    EMAILOCTOPUS_API_KEY: {
      type: "sst.sst.Secret"
      value: string
    }
  }
}
