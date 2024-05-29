import * as Print from "expo-print"
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

  const [selectedPrinter, setSelectedPrinter] = useState<Print.Printer>()

  const printTankhah = async (data: TankhahPrint[]) => {
    // On iOS/android prints the given html. On web prints the HTML from the current page.
    await Print.printAsync({
      html: tankhahTemplate(data),
      printerUrl: selectedPrinter?.url, // iOS only
    })
  }

  return {printTankhah}
}

interface TankhahPrint {
  opType: string
  date: string
  amount: string
  description?: string
}
const tankhahTemplate = (rows: TankhahPrint[]) => {
  const trs = rows.map((i) => `<tr>
  <td>${i.opType|| "ندارد"}</td>
  <td>${i.date || "ندارد"}</td>
  <td>${i.amount || "ندارد"}</td>
  <td>${i.description || "ندارد"}</td>
  </tr>`)
  const baseHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>Bank Transfers</title>
  <link rel="stylesheet" href="https://cdn.rtlcss.com/bootstrap/v4.2.1/css/bootstrap.min.css" integrity="sha384-vus3nQHTD+5mpDiZ4rkEPlnkcyTP+49BhJ4wJeJunw06ZAp+wzzeBPUXr42fi8If" crossorigin="anonymous">
</head>
<body>
  <div class="container mt-5">
    <h2 class="mb-4">فاندو تنخواه</h2>
    <table class="table table-bordered table-striped">
      <thead class="thead-dark">
        <tr>
          <th style="width:10%" scope="col">عملیات</th>
          <th style="width:15%" scope="col">روز</th>
          <th scope="col">مقدار</th>
          <th scope="col">توضیحات</th>
        </tr>
      </thead>
      <tbody>
       ${trs}
      </tbody>
    </table>
  </div>

  <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
    <script src="https://cdn.rtlcss.com/bootstrap/v4.2.1/js/bootstrap.min.js" integrity="sha384-a9xOd0rz8w0J8zqj1qJic7GPFfyMfoiuDjC9rqXlVOcGO/dmRqzMn34gZYDTel8k" crossorigin="anonymous"></script>
</body>
</html>
`

  return baseHtml
}
