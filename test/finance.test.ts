import { calcTransferFee } from "../app/utils/finance"
import { PaymentMethod } from "../app/models/realm/models"

describe("calcTransferFee", () => {
  it("calculates fee for ctc", () => {
    expect(calcTransferFee(1, "ctc")).toBe(9000)
    expect(calcTransferFee(10000000, "ctc")).toBe(9000)
    expect(calcTransferFee(10000001, "ctc")).toBe(12200)
    expect(calcTransferFee(20000000, "ctc")).toBe(12200)
    expect(calcTransferFee(20000001, "ctc")).toBe(15400)
  })

  it("calculates fee for paya", () => {
    expect(calcTransferFee(100000, "paya")).toBe(3000)
    expect(calcTransferFee(300000000, "paya")).toBe(75000)
    expect(calcTransferFee(1000000, "paya")).toBe(10000)
    expect(calcTransferFee(1000000000, "paya")).toBe(75000)
  })

  it("calculates fee for satna", () => {
    expect(calcTransferFee(100000, "satna")).toBe(2000)
    expect(calcTransferFee(2000000000, "satna")).toBe(350000)
    expect(calcTransferFee(20000000000, "satna")).toBe(350000)
  })

//   it("calculates fee for pol-r", () => {
//     expect(calcTransferFee(2000000000, "pol-r")).toBe(40000)
//     expect(calcTransferFee(10000000, "pol-r")).toBe(40000)
//     expect(calcTransferFee(20000000000, "pol-r")).toBe(40000)
//   })

//   it("calculates fee for pol-c", () => {
//     expect(calcTransferFee(10000000, "pol-c")).toBe(30000)
//     expect(calcTransferFee(20000000000, "pol-c")).toBe(30000)
//   })

//   it("calculates fee for pol-d", () => {
//     expect(calcTransferFee(2000000000, "pol-d")).toBe(20000)
//     expect(calcTransferFee(10000000, "pol-d")).toBe(20000)
//     expect(calcTransferFee(20000000000, "pol-d")).toBe(20000)
//   })

  it("calculates fee for sts", () => {
    expect(calcTransferFee(100000, "sts")).toBe(250)
    expect(calcTransferFee(2000000000, "sts")).toBe(250)
    expect(calcTransferFee(10000000, "sts")).toBe(250)
    expect(calcTransferFee(20000000000, "sts")).toBe(250)
  })

  it("returns 0 for other methods", () => {
    const others: PaymentMethod[] = ["cash", "pos", "other"]
    for (const method of others) {
      expect(calcTransferFee(1000000, method)).toBe(0)
    }
  })
}) 