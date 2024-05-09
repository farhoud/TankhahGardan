import { PaymentMethod } from "app/models/realm/models"

export function calcTransferFee(amount: number, method: PaymentMethod) {
  switch (method) {
    case "ctc":
      let step = ((amount - 1) / 10000000) >> 0
      return Math.min(46400, 7200 + 2800 * step)
    case "paya":
      let total = 0.01 * amount
      return Math.max(Math.min(30000, total), 2400)
    case "satna":
      let total_satna = 0.02 * amount
      return Math.min(280000, total_satna)
    default:
      return 0
  }
}
