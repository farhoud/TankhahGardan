import * as Print from "expo-print"
import { number } from "mobx-state-tree/dist/internal"
import { useState } from "react"

export interface PrintProps<T> {
  /**
   * An optional style override useful for padding & margin.
   */
  data: T
  template: string
}

/**
 * Describe your component here
 */
export const usePrint = () => {

  const [selectedPrinter] = useState<Print.Printer>()

  const printTankhahFunds = async (data: TankhahPrint[], fundsTotal: string, start: string, end: string) => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    const body = renderFundBody(data, fundsTotal, start, end)
    await Print.printAsync({
      html: htmlBase(body),
      printerUrl: selectedPrinter?.url, // iOS only
    })
  }

  const printTankhahSpends = async (data: TankhahPrint[], spendsTotal: number, group: string, start: string, end: string) => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    const body = renderSpendBody(data, spendsTotal, group, start, end)
    await Print.printAsync({
      html: htmlBase(body),
      printerUrl: selectedPrinter?.url, // iOS only
    })
  }

  return { printTankhahFunds, printTankhahSpends }
}

interface TankhahPrint {
  opType: string
  date: string
  amount: string
  description?: string
  fee: string,
  info: string,
}


const fundTableMapper = (rows: TankhahPrint[]) => rows.filter(i => i.opType === "fund").map((i, index) => `<tr>
<td>${index + 1}</td>
<td>${i.date || "ندارد"}</td>
<td>${i.info || "ندارد"}</td>
<td style="direction: rtl;">${formatted(i.amount)}</td>
<td>${i.description || "ندارد"}</td>
</tr>`)

const spentTableMapper = (rows: TankhahPrint[]) => rows.filter(i => i.opType !== "fund").map((i, index) => `<tr>
<td>${index + 1}</td>
<td>${i.date || "ندارد"}</td>
<td>${i.info || "ندارد"}</td>
<td style="direction: rtl;">${formatted(i.amount)}</td>
<td style="direction: rtl;">${formatted(i.fee)}</td>
<td>${i.description || "ندارد"}</td>
</tr>`)

const renderSpendBody = (rows: TankhahPrint[], spendTotal: number, group: string, start: string, end: string) => {
  const spends = spentTableMapper(rows)
  return `
<body style="font-family: Vazirmatn FD, sans-serif;">>
      <div class="container mt-5">
        <h4 class="mb-4">شرکت ساختمانی ماندگار</h4>
        <h4 class="mb-4"> صورت هزینه های پروژه ${group}</h4>
        <p class="mb-2"> تاریخ: ${start}-${end} </p>
        <table class="table table-bordered table-striped">
          <thead class="thead-dark">
            <tr>
              <th style="width: 5%" scope="col">ردیف</th>
              <th style="width: 15%" scope="col">تاریخ</th>
              <th style="width: 40%" scope="col">شرح</th>
              <th scope="col">مبلغ</th>
              <th scope="col">کارمزد</th>
              <th scope="col">توضیحات</th>
            </tr>
          </thead>
          <tbody>
            ${spends}
            <tr>
              <td colspan="3">جمع کل هزینه ها</td>
              <td colspan="3">${formatted(spendTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    </body>`
}

const renderFundBody = (rows: TankhahPrint[], fundsTotal: number, start: string, end: string) => {
  const funds = fundTableMapper(rows)
  return `<body style="font-family: Vazirmatn FD, sans-serif;">
  <div class="container mt-5">
    <h4 class="mb-4">شرکت ساختمانی ماندگار</h4>
    <h4 class="mb-4">صورت خلاصه تنخواه گردان دریافتی</h4>
    <p class="mb-4"> تاریخ: ${start}-${end} </p>
    <table class="table table-bordered table-striped">
      <thead class="thead-dark">
        <tr>
          <th style="width: 5%" scope="col">ردیف</th>
          <th style="width: 15%" scope="col">تاریخ</th>
          <th style="width: 40%" scope="col">شرح</th>
          <th scope="col">مبلغ</th>
          <th scope="col">توضیحات</th>
        </tr>
      </thead>
      <tbody>
        ${funds}
        <tr>
          <td colspan="3">جمع کل دریافتی</td>
          <td colspan="3">${formatted(fundsTotal)}</td>
        </tr>
      </tbody>
    </table>
  </div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
</body>`
}

const htmlBase = (body: string) => {

  const baseHtml = `
  <!DOCTYPE html>
  <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <title>Bank Transfers</title>
      <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003//misc/Farsi-Digits/Vazirmatn-FD-font-face.css" rel="stylesheet" type="text/css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.rtl.min.css" integrity="sha384-gXt9imSW0VcJVHezoNQsP+TNrjYXoGcrqBZJpry9zJt8PCQjobwmhMGaDHTASo9N" crossorigin="anonymous"> 
    </head>

    ${body}

  </html>  
`

  return baseHtml
}

const formatted = (amount: number | string) => {
  if (typeof amount === 'string')
    amount = Number(amount)
  if (amount === 0)
    return "-"
  return new Intl.NumberFormat('fa-IR', {
    // style: 'currency',
    // currency: 'IRR',
    maximumFractionDigits: 0
  }).format(amount);
}
