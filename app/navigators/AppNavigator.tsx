/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import {
  CommonActions,
  LinkingOptions,
  NavigationContainer,
  NavigationProp,
  NavigatorScreenParams,
  getStateFromPath,
  useNavigation,
} from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import React from "react"
import * as Screens from "app/screens"
import Config from "../config"
import { CalendarItemEnum, useStores } from "../models"
import { AppTabNavigator, AppTabParamList } from "./AppTabNavigator"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { Appbar } from "react-native-paper"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import Constants from "expo-constants"
import * as Linking from "expo-linking"
import { ShareIntentModule, getScheme, getShareExtensionKey } from "expo-share-intent"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppStackParamList = {
  Login: undefined
  AppTabs: NavigatorScreenParams<AppTabParamList>
  TankhahItem: { itemId: string; archived?: boolean }
  TankhahSpendForm: { itemId?: string }
  SpendImport: undefined
  TankhahFundForm: { itemId?: string }
  TestScreen: undefined
  ImageView: { images: string[]; index?: number }
  Attendance: undefined
  AttendanceForm: undefined
  Worker: { itemId?: string; mode?: "select" | "manage" }
  WorkerDetail: { itemId?: string }
  ProjectList: { itemId?: string; mode?: "select" | "manage" }
  ProjectDetail: { itemId?: string }
  TankhahGroupList: { itemId?: string; mode?: "select" | "manage" }
  TankhahGroupDetail: { itemId?: string }
  ReceiptItemList: { itemId?: string }
  NoteForm: { itemId?: string }
  NoteView: { itemId: string }
  Print: undefined
  Backup: undefined
  TankhahSearch: { archiveId?: string }
  CalendarSearch: undefined
  TankhahArchive: undefined
  ShareIntent: undefined
  CalendarItem: { itemId: string; itemType: keyof typeof CalendarItemEnum }
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

export type AppNavigation = NavigationProp<AppStackParamList>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = observer(function AppStack() {
  const {
    authenticationStore: { isAuthenticated },
  } = useStores()
  const navigation = useNavigation<AppNavigation>()
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "AppTabs", params: { screen: "TankhahHome", params: {} } }],
        }),
      )
    }
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isAuthenticated ? "AppTabs" : "Login"}
      // initialRouteName="TestScreen"
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="AppTabs" component={AppTabNavigator} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Screens.LoginScreen} />
        </>
      )}

      <Stack.Group>
        <Stack.Screen name="TankhahItem" component={Screens.TankhahItemScreen} />
        <Stack.Screen
          name="TankhahSpendForm"
          component={Screens.TankhahSpendFormScreen}
          options={{
            headerShown: true,
            header: () => (
              <Appbar.Header mode="small">
                <Appbar.BackAction onPress={goBack} />
                <Appbar.Content title="خرج" />
              </Appbar.Header>
            ),
          }}
        />
        <Stack.Screen name="SpendImport" component={Screens.SpendImportScreen} />
        <Stack.Screen
          name="TankhahGroupList"
          options={{ presentation: "modal" }}
          component={Screens.TankhahGroupListScreen}
        />
        <Stack.Screen name="TankhahGroupDetail" component={Screens.TankhahGroupDetailScreen} />
        <Stack.Screen name="ReceiptItemList" component={Screens.ReceiptItemListScreen} />
        <Stack.Screen name="TankhahFundForm" component={Screens.TankhahChargeFromScreen} />
        <Stack.Screen
          name="Print"
          component={Screens.PrintScreen}
          options={{
            headerShown: true,
            header: () => (
              <Appbar.Header mode="small">
                <Appbar.BackAction onPress={goBack} />
              </Appbar.Header>
            ),
          }}
        />
        <Stack.Screen
          name="TankhahArchive"
          component={Screens.TankhahArchiveScreen}
          options={{
            headerShown: true,
            header: () => (
              <Appbar.Header mode="small">
                <Appbar.BackAction onPress={goBack} />
              </Appbar.Header>
            ),
          }}
        />
        <Stack.Screen name="TankhahSearch" component={Screens.TankhahSearchScreen} />
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen
          name="Worker"
          options={{ presentation: "modal" }}
          component={Screens.WorkerScreen}
        />
        <Stack.Screen name="WorkerDetail" component={Screens.WorkerDetailScreen} />
        <Stack.Screen
          name="ProjectList"
          options={{ presentation: "modal" }}
          component={Screens.ProjectListScreen}
        />
        <Stack.Screen name="ProjectDetail" component={Screens.ProjectDetailScreen} />
        <Stack.Screen name="CalendarSearch" component={Screens.CalendarSearchScreen} />
        <Stack.Screen
          name="CalendarItem"
          component={Screens.CalendarItemScreen}
          options={{
            headerShown: true,
            header: () => (
              <Appbar.Header mode="small">
                <Appbar.BackAction onPress={goBack} />
              </Appbar.Header>
            ),
          }}
        />
      </Stack.Group>

      {/** 🔥 Your screens go here */}
      <Stack.Screen
        name="ImageView"
        component={Screens.ImageViewScreen}
        options={{
          headerShown: true,
          header: () => (
            <Appbar.Header mode="small">
              <Appbar.BackAction onPress={goBack} />
            </Appbar.Header>
          ),
        }}
      />

      {/* <Stack.Screen name="NoteList" component={Screens.NoteListScreen} /> */}
      <Stack.Screen name="Backup" component={Screens.BackupScreen} />
      <Stack.Screen
        name="ShareIntent"
        component={Screens.ShareIntentScreen}
        options={{
          headerShown: true,
          header: () => (
            <Appbar.Header mode="small">
              <Appbar.BackAction onPress={goBack} />
            </Appbar.Header>
          ),
        }}
      />
      {/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
    </Stack.Navigator>
  )
})

// Web linking configuration
const PREFIX = Linking.createURL("/")
const PACKAGE_NAME =
  Constants.expoConfig?.android?.package || Constants.expoConfig?.ios?.bundleIdentifier

const linking: LinkingOptions<AppStackParamList> = {
  prefixes: [`${Constants.expoConfig?.scheme}://`, `${PACKAGE_NAME}://`, PREFIX],
  config: {
    initialRouteName: "AppTabs",
    screens: {
      Login: {
        path: "",
      },
      AppTabs: {
        screens: {
          TankhahHome: {
            path: "home/:itemId?",
          },
        },
      },
      TankhahItem: { path: "spenditem/:itemId?" },
      TankhahSpendForm: { path: "spendform/:itemId?" },
      ShareIntent: { path: "shareintent" },
    },
  },
  // see: https://reactnavigation.org/docs/configuring-links/#advanced-cases
  getStateFromPath(path, config) {
    // REQUIRED FOR iOS FIRST LAUNCH
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
      // redirect to the ShareIntent Screen to handle data with the hook
      console.debug("react-navigation[getStateFromPath] redirect to ShareIntent screen")
      return {
        routes: [
          {
            name: "ShareIntent",
          },
        ],
      }
    }
    return getStateFromPath(path, config)
  },
  subscribe(listener: (url: string) => void): undefined | void | (() => void) {
    console.debug("react-navigation[subscribe]", PREFIX, PACKAGE_NAME)
    const onReceiveURL = ({ url }: { url: string }) => {
      if (url.includes(getShareExtensionKey())) {
        // REQUIRED FOR iOS WHEN APP IS IN BACKGROUND
        console.debug("react-navigation[onReceiveURL] Redirect to ShareIntent Screen", url)
        listener(`${getScheme()}://shareintent`)
      } else {
        console.debug("react-navigation[onReceiveURL] OPEN URL", url)
        listener(url)
      }
    }
    const shareIntentStateSubscription = ShareIntentModule?.addListener(
      "onStateChange",
      (event) => {
        // REQUIRED FOR ANDROID WHEN APP IS IN BACKGROUND
        console.debug("react-navigation[subscribe] shareIntentStateListener", event.value)
        if (event.value === "pending") {
          listener(`${getScheme()}://shareintent`)
        }
      },
    )
    const shareIntentValueSubscription = ShareIntentModule?.addListener(
      "onChange",
      async (event) => {
        // REQUIRED FOR IOS WHEN APP IS IN BACKGROUND
        console.debug("react-navigation[subscribe] shareIntentValueListener", event.value)
        const url = await linking.getInitialURL!()
        if (url) {
          onReceiveURL({ url })
        }
      },
    )
    const urlEventSubscription = Linking.addEventListener("url", onReceiveURL)
    return () => {
      // Clean up the event listeners
      shareIntentStateSubscription?.remove()
      shareIntentValueSubscription?.remove()
      urlEventSubscription.remove()
    }
  },
  // https://reactnavigation.org/docs/deep-linking/#third-party-integrations
  async getInitialURL() {
    console.debug("react-navigation[getInitialURL] ?")
    // REQUIRED FOR ANDROID FIRST LAUNCH
    const needRedirect = ShareIntentModule?.hasShareIntent(getShareExtensionKey())
    console.debug("react-navigation[getInitialURL] redirect to ShareIntent screen:", needRedirect)
    if (needRedirect) {
      return `${Constants.expoConfig?.scheme}://shareintent`
    }
    // As a fallback, do the default deep link handling
    const url = await Linking.getLinkingURL()
    return url
  },
}

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} linking={linking} {...props}>
      <BottomSheetModalProvider>
        <AppStack />
      </BottomSheetModalProvider>
    </NavigationContainer>
  )
})
