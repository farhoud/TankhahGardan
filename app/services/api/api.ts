/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/Services.md)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type { ApiConfig, ApiFeedResponse } from "./api.types"
import { SpendFormStoreSnapshotIn } from "app/models"
import { addMonths, newDate } from "date-fns-jalali"
import { PaymentMethod } from "app/models/realm/tankhah"
import { parseLlmResponse } from "app/utils/llmJsonParser"

type SpendPart = Partial<SpendFormStoreSnapshotIn>
interface GPTSpendPart extends Omit<SpendPart, "doneAt"> {
  doneAt?: [number, number, number, number, number, number]
  title?: string
  category?: string
}

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: "https://openrouter.ai/api/v1",
  timeout: 50000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    if (!config.url) {
      throw new Error("API url is required")
    }
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,

    })
  }

  /**
   * Gets a list of recent React Native Radio episodes.
   */
  async extractInfo(
    text: string,
    apiKey: string,
    model: string
  ): Promise<{ extracted: SpendPart; kind: "ok" } | GeneralApiProblem> {
    // make the api call
    const messages = [
      {
        role: "user",
        content: `You are a specialized assistant for analyzing bank receipts and transaction reports in Persian. Your task is to extract specific key information from the provided text and present it in a structured format.
Extraction Requirements:
trackingNum: The tracking number of the transaction. Look for keywords like "شماره پیگیری" or "کدرهگیری". If not found, return null.
paymentMethod: The method of money transfer. Categorize as follows:
ctc for "انتقال کارت به کارت"
paya for "انتقال پایا"
satna for "انتقال ساتنا"
pos for "خرید کالا", "خدمات", or "برداشت وجه"
sts for "انتقال وجه سپرده به سپرده"
pol-r for "انتقال وجه پل"
other for any other method.
If the method cannot be determined, return null.
doneAt: The date and time of the transaction. The text may use the Hijri Shamsi calendar. Convert this to array of [year,month,day,hours,minutes,seconds] in hejri shamsi, return null.
recipient: The name of the recipient of the transaction. If not available, return null.
accountNum: The recipient's card number ("کارت"), IBAN ("شبا"), or account number ("شماره حساب"). If none of these are found, return null.
amount: The amount of money transferred or withdrawn. Ignore any remaining or balance amounts. If the amount cannot be identified, return null.

Formatting Rules:
All numerical values (e.g., in trackingNum, accountNum, and amount) must be converted from Persian or Arabic numerals to English numerals.
If any key information is not found in the text, its corresponding value must be null.
Convert Hijri Shamsi calendar to Georgian calendar with care 

Input Text:
${text || ""}`,
      },
    ]

    // transform the data into the format we are expecting
    try {
      const response: ApiResponse<ApiFeedResponse> = await this.apisauce.post(`chat/completions`, {
        messages: messages,
        model: model,
        temperature: 0.6,
        response_format: {
          type: "json_object",
        },
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      })

      console.debug(JSON.stringify(response, undefined, 2))
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const rawData = (response.data as any).choices[0].message.content

      // This is where we transform the data into the shape we expect for our MST model.
      const extracted = JSON.parse(rawData) as GPTSpendPart
      let doneAt
      let amount
      if (extracted.doneAt) {
        doneAt = doneAt = addMonths(newDate(...extracted.doneAt), -1)
      }
      if (extracted.amount) {
        amount = Number(extracted.amount)
      }
      Object.keys(extracted).forEach((key) => {
        if (extracted[key] === null) {
          delete extracted[key];
        }
      });
      return { kind: "ok", extracted: { ...extracted, doneAt, amount } }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
