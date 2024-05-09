import { View, KeyboardAvoidingView } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TabView, SceneMap } from "react-native-tab-view"
import { BasicFormScreen } from "./BasicFormScreen"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { BuyFormScreen } from "./BuyFormScreen"
import { MoneyFormScreen } from "./MoneyFormScreen"
import { StepBar } from "./StepBar"
import { Header } from "./Header"
import { useStores } from "app/models"
import { useState, useEffect, useLayoutEffect, FC, useMemo } from "react"
import { AppStackScreenProps } from "app/navigators"
import { useObject } from "@realm/react"
import { Spend } from "app/models/realm/models"
import { BSON } from "realm"
import { useShareIntentContext } from "expo-share-intent"
import { Text } from "app/components"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"

export const TankhahSpendFormScreen: FC<AppStackScreenProps<"TankhahSpendForm">> = observer(
  function TankhahSpendFormScreen(_props) {
    const itemId = _props.route.params.itemId
    const spend = useObject(Spend, new BSON.ObjectID(itemId))
    const [index, setIndex] = useState(0)
    const insets = useSafeAreaInsets()
    const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntentContext()

    const navigation = useNavigation()
    const {
      spendFormStore: { paymentType, errors, _id, setSpend, applyShareText },
    } = useStores()
    const routes = useMemo(() => {
      if (paymentType === "buy") {
        return [
          { key: "step1", title: "پایه" },
          { key: "step2", title: "اجناس" },
          { key: "step3", title: "بانکی" },
        ]
      }
      return [
        { key: "step1", title: "پایه" },
        { key: "step3", title: "بانکی" },
      ]
    }, [paymentType])
    const fromText = useMemo(() => {
      let res
      if (hasShareIntent && shareIntent.text) {
        res = applyShareText(shareIntent.text)
        resetShareIntent()
      }
      if (!res) {
        resetShareIntent()
      }
      return res
    }, [hasShareIntent, shareIntent, error])

    useEffect(() => {
      switch (index) {
        case 0:
          setIndex(0)
          break
        case 1:
          if (errors.group) {
            setIndex(0)
          } else setIndex(1)
          break
        case 2:
          if (errors.recipient) {
            setIndex(1)
          } else setIndex(2)
          break
        default:
          setIndex(0)
      }
    }, [index])

    useEffect(() => {
      if (spend && _id !== spend._id.toHexString()) {
        setSpend(spend)
      }
    }, [spend])

    const renderScene = SceneMap({
      step1: BasicFormScreen,
      step2: BuyFormScreen,
      step3: MoneyFormScreen,
    })

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Header
            jumpTo={(rouet) => {
              setIndex(0)
            }}
          ></Header>
        ),
      })
    }, [])

    return (
      <BottomSheetModalProvider>
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1, justifyContent: "flex-end", marginBottom: -15 }}
          contentContainerStyle={{ flex: 1 }}
        >
          {fromText && <Text>استخراج از متن</Text>}
          <View
            style={{
              flex: 1,
              paddingBottom: insets.bottom + 15,
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
      </BottomSheetModalProvider>
    )
  },
)
