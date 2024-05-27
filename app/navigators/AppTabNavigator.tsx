import { CompositeScreenProps } from "@react-navigation/native"
import React from "react"
import { Icon, useTheme } from "react-native-paper"
import { translate } from "../i18n"
import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"
import * as Screens from "app/screens"

import {
  createMaterialBottomTabNavigator,
  MaterialBottomTabScreenProps,
} from "react-native-paper/react-navigation"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"

export type AppTabParamList = {
  TankhahHome: { itemId?: string }
  AttendanceHome: undefined
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppTabScreenProps<T extends keyof AppTabParamList> = CompositeScreenProps<
  MaterialBottomTabScreenProps<AppTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Tab = createMaterialBottomTabNavigator<AppTabParamList>()

/**
 * This is the main navigator for the Tankhah screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `TankhahNavigator`.
 */
export function AppTabNavigator() {
  const theme = useTheme()
  return (
    <Tab.Navigator sceneAnimationEnabled theme={theme} labeled={false} shifting>
      <Tab.Screen
        name="TankhahHome"
        component={Screens.TankhahHomeScreen}
        options={{
          tabBarLabel: translate("tabNavigator.tankhahTab"),
          tabBarIcon: ({ color }) => <Icon source="cash-fast" color={color} size={26} />,
        }}
      />
      <Tab.Screen
        name="AttendanceHome"
        component={Screens.AttendanceHomeScreen}
        options={{
          tabBarLabel: translate("tabNavigator.attendanceTab"),
          tabBarIcon: ({ color }) => (
            <Icon source="calendar-account-outline" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
