import { SpendFormStoreSnapshotIn } from "app/models"
type SpendPart = Partial<SpendFormStoreSnapshotIn>
type SpendPartFunction = (text: string) => {
  extracted?: SpendPart
  subFunction?: SpendPartFunction[]
} | null

type Caster = <K extends keyof SpendPart>(value: RegExpMatchArray) => SpendPart[K] | null

export function parseText(text: string): SpendPart {
  const patterns: SpendPartFunction[] = [paymentTypeParser]
  let extracted = {}
  for (const f of patterns) {
    const res = f(text)
    console.log("res", res)
    if (res?.subFunction) {
      patterns.push(...res.subFunction)
    }
    if (res?.extracted) {
      extracted = { ...extracted, ...res.extracted }
    }
  }
  return extracted
}

const paymentTypeParser: SpendPartFunction = (text) => {
  if (text.includes("کارت به کارت")) {
    const subFunction = [...BackShahrReceiptBase, ...BackShahrReceiptCTC].map((i) => {
      return regMatcherFactory(...i)
    })
    return { extracted: { paymentMethod: "ctc" }, subFunction }
  }
  if (text.includes("انتقال وجه پایا")) {
    const subFunction = [...BackShahrReceiptBase, ...BackShahrReceiptPaya].map((i) => {
      return regMatcherFactory(...i)
    })
    return { extracted: { paymentMethod: "paya" }, subFunction }
  }
  return null
}

const regMatcherFactory =
  <K extends keyof SpendPart>(fieldName: K, pattern: RegExp, caster: Caster) =>
  (text: string) => ({ extracted: regMatcher(text, fieldName, pattern, caster) })

const regMatcher = <K extends keyof SpendPart>(
  text: string,
  fieldName: K,
  pattern: RegExp,
  caster: Caster,
): SpendPart[K] | null => {
  const res = text.match(pattern)
  const casted = res && caster(res)
  if (res && casted) return { [fieldName]: casted }
  return null
}

const stringCaster = (value: RegExpMatchArray): string | null => {
  if (value.length == 2) {
    return value[1]
  }
  return null
}

const numberCaster = (value: RegExpMatchArray): number | null => {
  if (value.length == 2) {
    console.log("amount of mablagh",value[1].replace(",",""))
    console.log("amount of mablagh numer", Number(value[1].replaceAll(",","")))
    return Number(value[1].replaceAll(",","")) ?? null
  }
  return null
}

const dateTimeCaster = (value: RegExpMatchArray): Date | null => {
  if (value.length == 3) {
    const [_, time, date] = value
    return new Date() ?? null
  }
  return null
}

const BackShahrReceiptBase: [keyof SpendPart, RegExp, Caster][] = [
  ["doneAt", /تاریخ و ساعت:\s*(\d{2}:\d{2}:\d{2}) - (\d{4}\/\d{2}\/\d{2})/, dateTimeCaster],
  ["recipient", /نام گیرنده:\s*(.+)/, stringCaster],
  ["trackingNum", /شماره پیگیری:\s*(.+)/, stringCaster],
  ["amount", /مبلغ:\s*([\d,]+)\s*ریال/, numberCaster],
]

const BackShahrReceiptCTC: [keyof SpendPart, RegExp, Caster][] = [
  ["accountNum", /کارت مقصد:\s*(.+)/, stringCaster],
]

const BackShahrReceiptPaya: [keyof SpendPart, RegExp, Caster][] = [
  ["accountNum", /شماره شبای مقصد:\s*(.+)/, stringCaster],
]

// انتقال وجه کارت به کارت با موفقیت انجام شد
// تاریخ و ساعت:
// 09:44:17 - 1403/02/07
// مبلغ: 50,000,000 ریال
// کارت مبدا:
// 5047-06*--2505
// بانک مبدا: بانک شهر
// کارت مقصد:
// 6037-99-*-4128
// نام گیرنده: رحمان رضايي
// بانک مقصد: بانک ملی
// شماره پیگیری: 130011316968
// درخواست انتقال وجه پایا با موفقیت ثبت شد
// تاریخ و ساعت:
// 20:19:33 - 1403/02/06
// مبلغ: 100,000,000 ریال
// سپرده مبدا: 4001002440016
// شماره شبای مقصد:
// IR13-0600-2422-7001-3182-3120-01
// نام گیرنده: راضيه حاجيان حسين آبادي
// بانک مقصد: بانک قرض‌الحسنه مهر ایران
// بابت: تاديه ديون
// وضعیت تراکنش: از طرف بانک پذیرفته شده
// وضعیت انتقال: آماده برای انجام انتقال وجه
// صورت حساب
// تاریخ و ساعت: 1403/02/17 - 15:17:58
// مبلغ برداشت: 673,000ریال
// شماره سپرده: 4001002440016
// موجودی: 38,234,015 ریال
// شرح: خريد باکارت5047061089482505 از ت 07024454 بانک  باکدرهگيري 308876 و ش م 272576308876
// صورت حساب
// تاریخ و ساعت: 1403/02/17 - 12:04:01
// مبلغ برداشت: 2,200,000ریال
// شماره سپرده: 4001002440016
// موجودی: 38,907,015 ریال
// شرح: خريد باکارت5047061089482505 از ت 30184673 بانک  باکدرهگيري 659606 و ش م 840128721150
// صورت حساب
// تاریخ و ساعت: 1403/02/16 - 13:53:32
// مبلغ برداشت: 250,000,000ریال
// شماره سپرده: 4001002440016
// موجودی: 45,407,015 ریال
// شرح: دستورپرداخت پايا کد دستور 14030216061218531295شعبه فرستنده116نام فرستندهفرجام/مجاهدزاده باغبادراني/منصورنام گيرندهعلي مهري دهنوي- خدمات کاربر ثالث
// صورت حساب
// تاریخ و ساعت: 1403/02/16 - 09:28:26
// مبلغ برداشت: 1,067,200ریال
// شماره سپرده: 4001002440016
// موجودی: 297,232,015 ریال
// شرح: انتقال از کارت 5047061089482505 به کارت 6037991941609566
// صورت حساب
// تاریخ و ساعت: 1403/02/17-16:14:08
// مبلغ واریز100000000 ریال
// شماره کارت:
// 5047-06*-*-2505
// موجودی: 138,234,015 ریال
// شرح: انتقال وجه اينترنتي از سپرده 4001001122577 به سپرده 4001002440016
