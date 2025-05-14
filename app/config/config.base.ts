export interface ConfigBaseProps {
  persistNavigation: "always" | "dev" | "prod" | "never"
  catchErrors: "always" | "dev" | "prod" | "never"
  exitRoutes: string[]
  apiKey: string,
  apiUrl: string,
}

export type PersistNavigationConfig = ConfigBaseProps["persistNavigation"]

const BaseConfig: ConfigBaseProps = {
  // This feature is particularly useful in development mode, but
  // can be used in production as well if you prefer.
  persistNavigation: "never",

  /**
   * Only enable if we're catching errors in the right environment
   */
  catchErrors: "always",

  /**
   * This is a list of all the route names that will exit the app if the back button
   * is pressed while in that screen. Only affects Android.
   */
  exitRoutes: ["ChargeList","TankhahHome"],

  /**
   * This is the API key for the API
   */
  apiKey: process.env.EXPO_PUBLIC_API_KEY || "",

  /**
   * This is the URL of the API
   */
  apiUrl: process.env.EXPO_PUBLIC_API_URL || "",
}

export default BaseConfig
