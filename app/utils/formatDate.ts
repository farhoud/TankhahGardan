import I18n from "i18n-js"

// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import type { Locale } from "date-fns"
import format from "date-fns/format"
import parseISO from "date-fns/parseISO"
import ar from "date-fns/locale/ar-SA"
import ko from "date-fns/locale/ko"
import en from "date-fns/locale/en-US"
import { FormatOptions, format as formatFa } from "date-fns-jalali"

type Options = Parameters<typeof format>[2]

const getLocale = (): Locale => {
  const locale = I18n.currentLocale().split("-")[0]
  return locale === "ar" ? ar : locale === "ko" ? ko : en
}

export const formatDate = (date: string, dateFormat?: string, options?: Options) => {
  const locale = getLocale()
  const dateOptions = {
    ...options,
    locale,
  }
  return format(parseISO(date), dateFormat ?? "MMM dd, yyyy", dateOptions)
}

export const formatDateIR = (date: Date, dateFormat?: string, options?: FormatOptions) => {
  return formatFa(date, dateFormat ?? "yy٫MM٫dd", options)
}

export const formatDateIRDisplay = (date: Date, dateFormat?: string, options?: FormatOptions) => {
  return formatFa(date, dateFormat ?? "EEE dd MMMM", options)
}

export const tomanFormatter = (value: number) => {
  const [hole, fraction] = Math.abs(value / 10)
    .toString()
    .split(".")
  const formatedHole = hole
    .toString()
    .split("")
    .reverse()
    .reduce((acc, curr, index) => {
      const res = curr + acc
      if ((index + 1) % 3 === 0) {
        return "٫" + res
      }
      return res
    })
    .replace(/^\٫/, "")
  return `${formatedHole}${fraction ? ".".concat(fraction) : ""}${value < 0 ? "-" : ""} ت`.toString()
}
