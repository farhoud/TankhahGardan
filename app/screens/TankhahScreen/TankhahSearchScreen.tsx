import React, { FC, useLayoutEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppNavigation, AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { spacing } from "app/theme"
import { Surface, Drawer, Appbar, useTheme, RadioButton, Switch } from "react-native-paper"
import Animated, { FadeInLeft, FadeInRight, FadeOutLeft, FadeOutRight } from "react-native-reanimated"
import { CommonActions, useNavigation } from "@react-navigation/native"
import { TxKeyPath, translate } from "app/i18n"
import { isValid } from "date-fns"
import { useQuery } from "@realm/react"
import { TankhahGroup } from "app/models/realm/tankhah"
import { OperationEnum, PaymentMethodEnum } from "app/models"
// import { useStores } from "app/models"

interface TankhahSearchScreenProps extends AppStackScreenProps<"TankhahSearch"> { }

export const TankhahSearchScreen: FC<TankhahSearchScreenProps> = observer(function TankhahSearchScreen() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  // Pull in navigation via hook
  const navigation = useNavigation<AppNavigation>()
  const theme = useTheme()

  const groups = useQuery({
    type: TankhahGroup,
    query: (item) => item.filtered("active == $0", true).sorted("order")
  })

  const opType = Object.keys(OperationEnum).map(i => translate(("opType." + i) as TxKeyPath))

  const pmType = Object.keys(PaymentMethodEnum).map(i => translate(("paymentMethod." + i) as TxKeyPath))

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <Appbar.Header>
          <Appbar.BackAction onPress={goBack}></Appbar.BackAction>
          <Appbar.Content title="" />
          <Appbar.Action
            icon="menu"
            onPress={() => {
              console.log(drawerOpen)
              setDrawerOpen(prev => !prev)
            }}
          />
        </Appbar.Header>
      ),
    })
  }, [])

  const renderDrawer = () => (
    <Animated.ScrollView nestedScrollEnabled scrollEnabled entering={FadeInLeft} exiting={FadeOutLeft} style={[$scrollView, { backgroundColor: theme.colors.background }]}>
      <Drawer.Section>
        {/* <Text text="عملیات" /> */}
        {groups.map(i => (
          <Drawer.Item
            right={() =>
              <Switch
                onValueChange={() => console.log('first')}
              />
            }
            style={{ flex: 1 }} id={i._id.toHexString()} label={i.name}></Drawer.Item>))}

      </Drawer.Section>
      <Drawer.Section>
        {/* <Text text="عملیات" /> */}
        {opType.map(i => (
          <Drawer.Item right={() =>
            <Switch
              onValueChange={() => console.log('first')}
            />
          } style={{ flex: 1 }} id={i} label={i}></Drawer.Item>))}

      </Drawer.Section>
      <Drawer.Section>
        {/* <Text text="عملیات" /> */}
        {pmType.map(i => (
          <Drawer.Item right={() =>
            <Switch
              onValueChange={() => console.log('first')}
            />
          } style={{ flex: 1 }} id={i} label={i}></Drawer.Item>))}

      </Drawer.Section>
    </Animated.ScrollView>
  )
  return (
    <>
      <Surface style={[$root]}>
        <Text text="tankhahSearch" />
        {drawerOpen && renderDrawer()}
      </Surface>
    </>
  )
})

const $root: ViewStyle = {
  flex: 1,
  position: "relative"
}

const $scrollView: ViewStyle = { height: "100%", width: 300, position: "absolute", right: 0 }
