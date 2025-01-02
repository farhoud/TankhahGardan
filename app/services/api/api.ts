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

type SpendPart = Partial<SpendFormStoreSnapshotIn>
interface GPTSpendPart extends Omit<SpendPart, "doneAt"> {
  doneAt?: [number, number, number, number, number, number]
}

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
  apiKey: Config.API_KEY,
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
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        "api-key": config.apiKey,
        Accept: "application/json",
      },
    })
  }

  async autoTitle(
    text: string,
  ): Promise<{ extracted: { title: string, category: string }; kind: "ok" } | GeneralApiProblem> {
    // make the api call
    const messages = [
      {
        role: "system",
        content: `You are a knowledgeable assistant specialized in naming and categorizing text note of clients for better access. you work at construction site and recored event throw notes.
you always format output to JSON with keys for a title for the text and category for the text. please follow these rules:
- if text is unclear return a  empty JSON
- title should be short and clear
- response language should be same as text


      text:
       ${text || ""}`,
      },
    ]

    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.post(
      `completions?api-version=2024-02-15-preview`,
      {
        messages: messages,
        temperature: 0.6,
        max_tokens: 800,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null,
      },
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = (response.data as any).choices[0].message.content
      console.log(rawData)

      // This is where we transform the data into the shape we expect for our MST model.
      const extracted = JSON.parse(rawData) as GPTSpendPart
      let doneAt
      let amount
      if (extracted.doneAt) {
        doneAt = addMonths(newDate(...extracted.doneAt), -1)
      }
      if (extracted.amount) {
        amount = Number(extracted.amount)
      }
      return { kind: "ok", extracted: { ...extracted, doneAt, amount } }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets a list of recent React Native Radio episodes.
   */
  async extractInfo(
    text: string,
  ): Promise<{ extracted: SpendPart; kind: "ok" } | GeneralApiProblem> {
    // make the api call
    const messages = [
      {
        role: "system",
        content: `You are a knowledgeable assistant specialized in 
      analyzing and bank receipt or report texts. Extract key information in JSON 
      format with keys 'trackingNum', 'doneAt', 'recipient', 'accountNum','paymentMethod', amount as number 'amount' . If
      certain information is not available, return null for the key.
      values are string or number except doneAt.
      paymentMethod is how money transferred and can be if انتقال کارت به کارت :'ctc' OR انتقال پایا : 'paya' OR انتقال ساتنا : 'satna' OR (انواع خرید کالا یا خدمات) : 'pos' OR انتقال سپرده به سپرده : 'sts' OR any other method : 'other' .
      doneAt is a hejri shamsi time and may not be available if available convert it to array of [year,month,day,hours,minutes,seconds] .
      accountNum is card (کارت) or sheba (شبا) or account number (شماره حساب) of the recipient (destination) .
      text:
       ${text || ""}`,
      },
    ]

    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.post(
      `completions?api-version=2024-02-15-preview`,
      {
        messages: messages,
        temperature: 0.6,
        max_tokens: 800,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null,
      },
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = (response.data as any).choices[0].message.content

      // This is where we transform the data into the shape we expect for our MST model.
      const extracted = JSON.parse(rawData) as GPTSpendPart
      let doneAt
      let amount
      if (extracted.doneAt) {
        doneAt = addMonths(newDate(...extracted.doneAt), -1)
      }
      if (extracted.amount) {
        amount = Number(extracted.amount)
      }
      return { kind: "ok", extracted: { ...extracted, doneAt, amount } }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
