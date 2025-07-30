import { TxKeyPath, translate } from "app/i18n"
import { TankhahItem, TankhahArchiveItem } from "./realm/tankhah"

export enum OperationEnum {
  all = "all",
  buy = "buy",
  transfer = "transfer",
  fund = "fund",
}
export enum PaymentMethodEnum { satna = "satna", paya = "paya", cash = "cash", ctc = "ctc", pos = "pos", other = "other", sts = "sts", pol_r = "pol-r", pol_c = "pol-c", pol_d = "pol-d" }

export enum CalendarItemEnum {
  attendance = "attendance",
  note = "note",
}

export function formatTitle(item: TankhahItem | TankhahArchiveItem) {
  switch (item.opType) {
    case OperationEnum.fund:
      return `دریافت`
    case OperationEnum.buy:
      return `${item.receiptItems?.map((i) => `${i.title}`).join("، ")}`
    case OperationEnum.transfer:
      return `${translate(("paymentMethod." + item.paymentMethod) as TxKeyPath)} به ${item.recipient || item.accountNum || "نامشخص"}`
    default:
      return ""
  }
}

export const iconMap = {
  fund: "cash-plus",
  buy: "cash-register",
  transfer: "cash-fast",
}

