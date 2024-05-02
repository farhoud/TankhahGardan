import * as React from "react"
import {
  View,
  KeyboardAvoidingView,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TabView, SceneMap } from "react-native-tab-view"
import { BasicFormScreen } from "./BasicFormScreen"
import { observer } from "mobx-react-lite"
import { Appbar } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { BuyFormScreen } from "./BuyFormScreen"
import { MoneyFormScreen } from "./MoneyFormScreen"
import { StepBar } from "./StepBar"

const routes = [
  { key: "contacts", title: "پایه" },
  { key: "albums", title: "شرح" },
  { key: "article", title: "بانکی" },
]

export const TankhahSpendFormScreen = observer(function TankhahSpendFormScreen() {
  const [index, setIndex] = React.useState(0)
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()


  const renderScene = SceneMap({
    contacts: BasicFormScreen,
    albums: BuyFormScreen,
    article: MoneyFormScreen,
    chat: BasicFormScreen,
  })

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              console.log("go back")
            }}
          />
          <Appbar.Content title="خرج" />
        </Appbar.Header>
      ),
    })
  }, [])

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, justifyContent: "flex-end", marginBottom:-15 }}
      contentContainerStyle={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          paddingBottom: insets.bottom+15,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={StepBar}
          tabBarPosition="bottom"
          onIndexChange={setIndex}
        />
      </View>
    </KeyboardAvoidingView>
  )
})