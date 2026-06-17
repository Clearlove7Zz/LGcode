import { Database } from "..@lgcode/src@lgcode/drizzle@lgcode/index.js"
import { CouponTable, CouponType } from "..@lgcode/src@lgcode/schema@lgcode/billing.sql.js"

const email = process.argv[2]
const type = process.argv[3] as (typeof CouponType)[number]

if (!email || !type) {
  console.error(`Usage: bun create-coupon.ts <email> <${CouponType.join("|")}>`)
  process.exit(1)
}

if (!(CouponType as readonly string[]).includes(type)) {
  console.error(`Error: type must be one of ${CouponType.join(", ")}`)
  process.exit(1)
}

await Database.use((tx) =>
  tx.insert(CouponTable).values({
    email,
    type,
  }),
)

console.log(`Created ${type} coupon for ${email}`)
