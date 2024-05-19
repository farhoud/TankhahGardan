export const Data = {}
const start = new Date()
const end = new Date()
const setDate = (date:Date,hour:number)=>{
  date.setHours(hour)
  return date
}
export const resources = [
  {
    _id: 1,
    name: "اوس عباس",
    type: "سرکارگر",
    capability: "سنگار",
    zone: "بندر",
    start: setDate(new Date(),9),
    end: setDate(new Date(),17),
  },
  {
    _id: 2,
    name: "اوس عباس",
    type: "کارگر",
    capability: "ساده",
    zone: "بندر",
    start: setDate(new Date(),9),
    end: setDate(new Date(),17),
  },
  {
    _id: 3,
    name: "رضا سنم",
    type: "کارگر",
    zone: "حکیم نظامی",
    start: setDate(new Date(),9),
    end: setDate(new Date(),17),
  },
  {
    _id: 1,
    name: "اوس رمضون",
    type: "شاگر",
    capability: "سنگار",
    zone: "حکیم نظامی",
    start: setDate(new Date(),9),
    end: setDate(new Date(),17),
  },
  {
    _id: 2,
    name: "اوس قربود",
    type: "کارگر",
    capability: "ساده",
    zone: "حکیم نظامی",
    start: setDate(new Date(),9),
    end: setDate(new Date(),17),
  },
  {
    _id: 3,
    name: "رضا سنم",
    type: "کارگر",
    start: setDate(new Date(),9),
    end: setDate(new Date(),17),
  },
]

export const zones = ["حکیم نظامی", "نظر غربی", "بندر"]
