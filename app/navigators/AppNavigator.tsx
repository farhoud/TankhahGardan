/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import {
  CommonActions,
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigationProp,
  NavigatorScreenParams,
  useNavigation,
} from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import React from "react"
import { useColorScheme } from "react-native"
import * as Screens from "app/screens"
import Config from "../config"
import { useStores } from "../models"
// import { DemoNavigator, DemoTabParamList } from "./DemoNavigator"
import { TankhahTabNavigator, TankhahTabParamList } from "./TankhahTabNavigator"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { colors } from "app/theme"
import { Appbar } from "react-native-paper"
import { TankhahSpendFormScreen as TestScreen } from "app/screens/SpendScreen/SpendFormScreen/TankhahSpendFormScreen"

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
  TankhahTabs: NavigatorScreenParams<TankhahTabParamList>
  TankhahSpendItem: { itemId: string }
  TankhahSpendForm: { itemId?: string }
  ChargeForm: { itemId?: string }
  // 🔥 Your screens go here
  // TankhahHome: undefined
  // TankhahDepositFrom: { itemId?: string }
  // TankhahSpendItem: { itemId: string }
  // TankhahWithdraw: { itemId?: string }
  TestScreen: undefined
  BuyItemForm: undefined
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

export type StackNavigation = NavigationProp<AppStackParamList>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = observer(function AppStack() {
  const {
    authenticationStore: { isAuthenticated },
  } = useStores()
  const navigation = useNavigation<StackNavigation>()
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "TankhahTabs", params: { screen: "TankhahHome", params: {} } }],
        }),
      )
    }
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
      // initialRouteName={isAuthenticated ? "TankhahTabs" : "Login"}
      initialRouteName="TestScreen"
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="TankhahTabs" component={TankhahTabNavigator} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Screens.LoginScreen} />
        </>
      )}

      <Stack.Group>
        <Stack.Screen name="TankhahSpendItem" component={Screens.TankhahSpendItemScreen} />
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
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen name="ChargeForm" component={Screens.TankhahChargeFromScreen} />

      </Stack.Group>


      {/** 🔥 Your screens go here */}
      <Stack.Screen name="BuyItemForm" component={Screens.BuyItemFormScreen} options={{presentation: 'modal'}}/>
      <Stack.Screen name="TestScreen" component={TestScreen} />
      {/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
    </Stack.Navigator>
  )
})

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const colorScheme = useColorScheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <AppStack />
    </NavigationContainer>
  )
})
