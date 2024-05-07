import { CompositeScreenProps } from "@react-navigation/native"
import React from "react"
import { Icon } from "../components"
import { translate } from "../i18n"
import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"
import * as Screens from "app/screens"

import {
  createMaterialBottomTabNavigator,
  MaterialBottomTabScreenProps,
} from "react-native-paper/react-navigation"

export type TankhahTabParamList = {
  TankhahHome: {itemId?:string}
  ChargeList: undefined
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type TankhahTabScreenProps<T extends keyof TankhahTabParamList> = CompositeScreenProps<
  MaterialBottomTabScreenProps<TankhahTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Tab = createMaterialBottomTabNavigator<TankhahTabParamList>()

/**
 * This is the main navigator for the Tankhah screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `TankhahNavigator`.
 */
export function TankhahTabNavigator() {
  return (
    <Tab.Navigator labeled={false} shifting>
      <Tab.Screen
        name="TankhahHome"
        component={Screens.TankhahHomeScreen}
        options={{
          tabBarLabel: translate("tankhahNavigator.homeTab"),
          tabBarIcon: ({ color }) => <Icon icon="spend" color={color} size={26} />,
        }}
      />
      <Tab.Screen
        name="ChargeList"
        component={Screens.TankhahChargeListScreen}
        options={{
          tabBarLabel: translate("tankhahNavigator.chargeTab"),
          tabBarIcon: ({ color }) => <Icon icon="charge" color={color} size={26} />,
        }}
      />
    </Tab.Navigator>
  )
}