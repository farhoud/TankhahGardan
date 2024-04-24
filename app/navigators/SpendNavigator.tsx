import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import React from "react"
import * as Screens from "app/screens"
import { colors } from "app/theme"

export type SpendStackParamList = {
  TankhahHome: undefined
  TankhahSpendItem: { itemId: string }
  TankhahSpendForm: { itemId?: string }
}

export type SpendStackScreenProps<T extends keyof SpendStackParamList> = NativeStackScreenProps<
  SpendStackParamList,
  T
>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<SpendStackParamList>()

export function SpendNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
      initialRouteName="TankhahHome"
    >
      <Stack.Screen name="TankhahHome" component={Screens.TankhahHomeScreen} />
      <Stack.Screen name="TankhahSpendItem" component={Screens.TankhahSpendItemScreen} />
      <Stack.Screen name="TankhahSpendForm" component={Screens.TankhahSpendFormScreen} />
    </Stack.Navigator>
  )
}
