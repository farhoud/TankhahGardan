/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import {
  CommonActions,
  NavigationContainer,
  NavigationProp,
  NavigatorScreenParams,
  useNavigation,
} from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import React from "react"
import * as Screens from "app/screens"
import Config from "../config"
import { useStores } from "../models"
import { AppTabNavigator, AppTabParamList } from "./AppTabNavigator"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { Appbar } from "react-native-paper"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"

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
  Welcome: undefined
  Login: undefined
  AppTabs: NavigatorScreenParams<AppTabParamList>
  TankhahItem: { itemId: string }
  TankhahSpendForm: { itemId?: string }
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
  TankhahSearch: undefined
  CalendarSearch: undefined
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
              <Appbar.Header>
                <Appbar.BackAction onPress={goBack} />
                <Appbar.Content title="خرج" />
              </Appbar.Header>
            ),
          }}
        />
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
              <Appbar.Header>
                <Appbar.BackAction onPress={goBack} />
              </Appbar.Header>
            ),
          }} />
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
      </Stack.Group>

      <Stack.Group>

        <Stack.Screen
          name="NoteForm"
          component={Screens.NoteFormScreen}
        />
        <Stack.Screen
          name="NoteView"
          component={Screens.NoteViewScreen}
          options={{
            headerShown: true,
            header: () => (
              <Appbar.Header>
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
            <Appbar.Header>
              <Appbar.BackAction onPress={goBack} />
            </Appbar.Header>
          ),
        }}
      />

      {/* <Stack.Screen name="NoteList" component={Screens.NoteListScreen} /> */}
      <Stack.Screen name="Backup" component={Screens.BackupScreen} />
      {/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
    </Stack.Navigator>
  )
})

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> { }

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} {...props}>
      <BottomSheetModalProvider>
        <AppStack />
      </BottomSheetModalProvider>
    </NavigationContainer>
  )
})
