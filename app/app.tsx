/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("./devtools/ReactotronConfig.ts")
}
import "./i18n"
import "./utils/ignoreWarnings"
import { useFonts } from "expo-font"
import React, { useMemo } from "react"
import Constants from "expo-constants"
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import * as Linking from "expo-linking"
import { useInitialRootStore } from "./models"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import * as storage from "./utils/storage"
import { CustomMD3Dark, CustomMD3Light, customFontsToLoad, fontConfig } from "./theme"
import Config from "./config"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useColorScheme, ViewStyle } from "react-native"
import { RealmProvider } from "@realm/react"
import { realmConfig } from "./models/realm/models"
import {
  PaperProvider,
  configureFonts,
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from "react-native-paper"
import {
  addStateListener,
  getScheme,
  getShareExtensionKey,
  hasShareIntent,
  ShareIntentProvider,
} from "expo-share-intent"
import { getStateFromPath } from "@react-navigation/native"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
})

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    ...CustomMD3Light.colors,
  },
}
const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...CustomMD3Dark.colors,
  },
}

// Web linking configuration
const PREFIX = Linking.createURL("/")
const PACKAGE_NAME =
  Constants.expoConfig?.android?.package || Constants.expoConfig?.ios?.bundleIdentifier

const config = {
  screens: {
    Login: {
      path: "",
    },
    AppTabs: {
      screens: {
        TankhahHome: {
          path: "home/:itemId?",
        },
        ChargeList: "chargelist",
      },
    },
    TankhahItem: { path: "spenditem/:itemId?" },
    TankhahSpendForm: { path: "spendform/:itemId?" },
    BuyItemForm: "buyform",
  },
}

interface AppProps {
  hideSplashScreen: () => Promise<boolean>
}

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
function App(props: AppProps) {
  const { hideSplashScreen } = props
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded] = useFonts(customFontsToLoad)

  const colorScheme = useColorScheme()
  const theme = useMemo(
    () => ({
      ...(colorScheme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme),
      fonts: configureFonts({ config: fontConfig }),
    }),
    [colorScheme],
  )

  const { rehydrated } = useInitialRootStore(() => {
    // This runs after the root store has been initialized and rehydrated.

    // If your initialization scripts run very fast, it's good to show the splash screen for just a bit longer to prevent flicker.
    // Slightly delaying splash screen hiding for better UX; can be customized or removed as needed,
    // Note: (vanilla Android) The splash-screen will not appear if you launch your app via the terminal or Android Studio. Kill the app and launch it normally by tapping on the launcher icon. https://stackoverflow.com/a/69831106
    // Note: (vanilla iOS) You might notice the splash-screen logo change size. This happens in debug/development mode. Try building the app for release.
    setTimeout(hideSplashScreen, 500)
  })

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!rehydrated || !isNavigationStateRestored || !areFontsLoaded) return null

  const linking = {
    prefixes: [`${Constants.expoConfig?.scheme}://`, `${PACKAGE_NAME}://`, PREFIX],
    config,
    getStateFromPath(path: string, config: any) {
      // REQUIRED FOR iOS FIRST LAUNCH
      if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
        // redirect to the ShareIntent Screen to handle data with the hook
        return {
          routes: [
            {
              name: "TankhahSpendForm",
            },
          ],
        }
      }
      return getStateFromPath(path, config)
    },
    subscribe(listener: (url: string) => void): undefined | void | (() => void) {
      const onReceiveURL = ({ url }: { url: string }) => {
        if (url.includes(getShareExtensionKey())) {
          // REQUIRED FOR iOS WHEN APP IS IN BACKGROUND
          listener(`${getScheme()}://spendform`)
        } else {
          listener(url)
        }
      }
      const shareIntentEventSubscription = addStateListener((event) => {
        // REQUIRED FOR ANDROID WHEN APP IS IN BACKGROUND
        if (event.value === "pending") {
          listener(`${getScheme()}://spendform`)
        }
      })
      const urlEventSubscription = Linking.addEventListener("url", onReceiveURL)
      return () => {
        // Clean up the event listeners
        shareIntentEventSubscription.remove()
        urlEventSubscription.remove()
      }
    },
    // https://reactnavigation.org/docs/deep-linking/#third-party-integrations
    async getInitialURL() {
      // REQUIRED FOR ANDROID FIRST LAUNCH
      const needRedirect = hasShareIntent(getShareExtensionKey())
      if (needRedirect) {
        return `${Constants.expoConfig?.scheme}://spendform`
      }
      // As a fallback, do the default deep link handling
      const url = await Linking.getInitialURL()
      return url
    },
  }

  // otherwise, we're ready to render the app
  return (
    <ShareIntentProvider
      options={{
        debug: false,
        // @ts-ignore
        onResetShareIntent: () => {
          // navigationRef?.current?.navigate("AppTabs", { screen: "TankhahHome", params: {} })
        },
      }}
    >
      <RealmProvider {...realmConfig}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ErrorBoundary catchErrors={Config.catchErrors}>
            <GestureHandlerRootView style={$container}>
              <PaperProvider theme={theme}>
                  <AppNavigator
                    theme={theme}
                    linking={linking}
                    initialState={initialNavigationState}
                    onStateChange={onNavigationStateChange}
                  />
              </PaperProvider>
            </GestureHandlerRootView>
          </ErrorBoundary>
        </SafeAreaProvider>
      </RealmProvider>
    </ShareIntentProvider>
  )
}

export default App

const $container: ViewStyle = {
  flex: 1,
}
