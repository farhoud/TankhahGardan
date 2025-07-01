import { PaymentMethod } from "app/models/realm/tankhah"

export function calcTransferFee(amount: number, method: PaymentMethod) {
  switch (method) {
    case "ctc":
      let step = ((amount - 1) / 10000000) >> 0
      return 9000 + 3200 * step
    case "paya":
      let total = 0.01 * amount
      return Math.max(Math.min(75000, total), 3000)
    case "satna":
      let total_satna = 0.02 * amount
      return Math.min(350000, total_satna)
    case "pol-r":
      let total_pol_r = 0.0002 * amount
      return Math.max(Math.min(40000, total_pol_r), 4000) + Math.max(40000, total_pol_r)
    case "pol-c":
      return Math.max(Math.min(30000, amount * 0.00015), 3000) + Math.max(80000, amount * 0.0004)
    case "pol-d":
      return Math.max(Math.min(20000, amount * 0.0001), 2000) + Math.max(100000, amount * 0.0005)
    case "sts":
      return 250
    default:
      return 0
  }
}
