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

type SpendPart = Partial<SpendFormStoreSnapshotIn>

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

  /**
   * Gets a list of recent React Native Radio episodes.
   */
  async extractInfo(text:string): Promise<{ kind: "ok", extracted: SpendPart } | GeneralApiProblem> {
    // make the api call
    const messages = [
      {
        role: "system",
        content: `"You are a knowledgeable assistant specialized in 
      analyzing and bank receipt or report texts. Extract key information in JSON 
      format with keys 'tackingNum', 'doneAt', 'recipient', 'accountNum','paymentMethod', amount as number 'amount' . If
      certain information is not available, return an empty string for that key. if you cant parse just return empty object no text"
      paymentMethod is how money transferred and can be: کارت به کارت : ctc OR  پایا: paya OR ساتنا: satna OR pos: خرید.
      doneAt is a hejri shamsi date in iran time zone convert it to Georgian utc.
      accountNum is card (کارت) or sheba (شبا) or account number (شماره) of the recipient.
      text:
       ${text || ""}`,
      },
    ]

    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.post(
      `completions?api-version=2024-02-15-preview`,
      {
        messages: messages,
        temperature: 0.7,
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
      const extracted: SpendPart =
      JSON.parse(rawData) as SpendPart
      if(extracted.doneAt){
        extracted.doneAt = new Date(extracted.doneAt)
        extracted.amount = Number(extracted.amount)
      }

      return { kind: "ok", extracted }
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
