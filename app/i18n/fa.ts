const fa = {
  opType: {
    buy: "خرید",
    transfer: "واریز",
    fund: "دریافتی",
    all: "همه"
  },
  paymentMethod: {
    satna: "ساتنا",
    paya: "پایا",
    cash: "نقد",
    ctc: "کارت به کارت",
    pos: "پوز",
    sts: "سپرده به سپرده",
    other: "دیگر",
  },
  accountNumType: {
    sheba: "شبا",
    card: "کارت",
    other: "حساب",
    placeHolder: "لطفا شماره {{type}} گیرنده را وارد کنید",
    label: "{{type}} گیرنده"
  },
  spend: {
    recipient: "دریافت کننده",
    group: "گروه",
    attachments: "پیوستها",
    trackingNum: "شماره پیگیری",
    doneAt: "تاریخ",
    paymentMethod: "روش پرداخت",
    opType: "نوع عملیات",
    amount: "مبلغ",
    transferFee: "کارمزد",
    total: "کل",
    accountNum: "حساب مقصد",
    description: "توضیحات",
    items: "آیتم‌ها",
  },
  common: {
    ok: "باشه!",
    cancel: "کنسل",
    back: "بازگشت",
    logOut: "خروج",
    edit: "تغییر",
    save: "ثبت",
    add: "اضافه",
    new: "جدید",
    not_found: "آیتم مورد نظر پیدا نشد!"
  },
  welcomeScreen: {
    postscript: "پیست: اپت اسولا این شکلی نیست",
    readyForLaunch: "آپلیکشین شما آماده اجراست!",
    exciting: "(اوه، این هیجان انگیز است!)",
    letsGo: "بزن بریم!",
  },
  errorScreen: {
    title: "مشکلی به وجود آمده!",
    friendlySubtitle:
      "این صفحه ای است که کاربران شما در هنگام تولید آن را با خطا مشاهده می کنند. شما می‌خواهید این پیام (واقع در «app/i18n/en.ts») و احتمالاً طرح‌بندی («app/screens/ErrorScreen») را سفارشی کنید. اگر می‌خواهید این مورد را به طور کامل حذف کنید، «app/app.tsx» را برای مؤلفه <ErrorBoundary> علامت بزنید.",
    reset: "اجرای دوباره برنامه",
    traceTitle: "خطا از پشته %{name}",
  },
  emptyStateComponent: {
    generic: {
      heading: "خیلی خالی... خیلی غمگین",
      content:
        "هنوز هیچ داده ای پیدا نشده است. برای بازخوانی یا بارگیری مجدد برنامه، روی دکمه کلیک کنید.",
      button: "بیایید دوباره این را امتحان کنیم",
    },
  },

  errors: {
    invalidEmail: "آدرس ایمیل نامعتبر است.",
  },
  loginScreen: {
    signIn: "ورود",
    enterDetails:
      "برای باز کردن قفل اطلاعات محرمانه، اطلاعات خود را در زیر وارد کنید. شما هرگز حدس نمی زنید که منتظر چه چیزی هستیم. یا شاید بخواهید؛ اینجا علم موشک نیست.",
    emailFieldLabel: "ایمیل",
    passwordFieldLabel: "پسورد",
    emailFieldPlaceholder: "آدرس ایمیل خود را وارد کنید",
    passwordFieldPlaceholder: "رمز عبور فوق العاده مخفی اینجاست",
    tapToSignIn: "برای ورود به سیستم ضربه بزنید!",
    hint: "نکته: می توانید از هر آدرس ایمیل و رمز عبور دلخواه خود استفاده کنید :)",
  },
  tabNavigator: {
    tankhahTab: "تنخواه",
    attendanceTab: "حضور",
    noteTab: "نوت"
  },
  tankhahChargeScreen: {
    amountLabel: "مقدار",
    amountPlaceholder: "مبلغ را وارد کنید",
    amountHelper: "مبلغ را درست وارد نشده",
    descriptionLabel: "توضیحات",
    descriptionPlaceholder: "توضیحات را وارد کنید",
    descriptionHelper: "مبلغ درست وارد نشده",
    dateLabel: "تاریخ",
    datePlaceholder: "تاریخ را وارد کنید",
    dateHelper: "تاریخ درست وارد نشده",
  },
  tankhahSpendFormScreen: {
    titleLabel: "عنوان",
    titlePlaceholder: "عنوان را وارد کنید",
    recipientLabel: "دریافت کننده",
    recipientPlaceholder: "دریافت کننده را وارد کنید",
    recipientHelper: "دریافت کننده درست وارد نشده",
    dateLabel: "تاریخ",
    datePlaceholder: "تاریخ را وارد کنید",
    dateHelper: "مبلغ درست وارد نشده",
    descriptionLabel: "توضیحات",
    descriptionPlaceholder: "توضیحات را وارد کنید",
    descriptionHelper: "توضیحات درست وارد نشده",
    feesLabel: "کارمزد بانک",
    feesPlaceholder: "کارمزد بانک را وارد کنید",
    trackingNumLabel: "شماره پیگیری",
    trackingNumPlaceholder: "شماره پیگیری را وارد کنید",
    destLabel: "مقصد",
    destPlaceholder: "شماره حساب یا کارت مورد نظر را وارد کنید",
    groupLabel: "گروه",
    groupPlaceholder: "گروه را وارد کنید",
  },
  receiptItemForm: {
    titleLabel: "عنوان",
    titlePlaceholder: "(الزامی) عنوان را وارد کنید",
    titleHelper: "فیلد عنوان اجباریست",
    descriptionLabel: "توضیحات",
    descriptionPlaceholder: "توضیحات را وارد کنید",
    defaultPriceLabel: "قیمت پیش فرض را وارد کنید",
    defaultPricePlaceholder: "قیمت پیش فرض درست وارد نشده",
    searchableLabel: "قابل جستجو",
  },
}

export default fa
export type Translations = typeof fa
