import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import * as Screens from "app/screens"
import { colors } from "app/theme"

export type ChargeStackParamList = {
  ChargeList: undefined
  ChargeForm: { itemId?: string }
}

export type ChargeStackScreenProps<T extends keyof ChargeStackParamList> = NativeStackScreenProps<
  ChargeStackParamList,
  T
>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<ChargeStackParamList>()

export function ChargeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
      initialRouteName="ChargeList"
    >
      <Stack.Screen name="ChargeList" component={Screens.TankhahChargeListScreen} />
      <Stack.Screen name="ChargeForm" component={Screens.TankhahChargeFromScreen} />
    </Stack.Navigator>
  )
}
