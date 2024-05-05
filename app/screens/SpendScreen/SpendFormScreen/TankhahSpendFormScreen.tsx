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
import { useState, useEffect, useLayoutEffect, FC } from "react"
import { AppStackScreenProps } from "app/navigators"
import { useObject } from "@realm/react"
import { Spend } from "app/models/realm/models"
import { BSON } from "realm"

const routes = [
  { key: "step1", title: "پایه" },
  { key: "step2", title: "شرح" },
  { key: "step3", title: "بانکی" },
]

export const TankhahSpendFormScreen: FC<AppStackScreenProps<"TankhahSpendForm">> = observer(
  function TankhahSpendFormScreen(_props) {
    const itemId = _props.route.params.itemId
    const spend = useObject(Spend, new BSON.ObjectID(itemId))
    const [index, setIndex] = useState(0)
    const insets = useSafeAreaInsets()
    const navigation = useNavigation()
    const {
      spendFormStore: { errors, _id, setSpend },
    } = useStores()

    useEffect(() => {
      console.log(index)
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

    useEffect(()=>{
      if(spend && _id !== spend._id.toHexString()){
        setSpend(spend)
      }
    },[spend])

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
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, justifyContent: "flex-end", marginBottom: -15 }}
        contentContainerStyle={{ flex: 1 }}
      >
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
    )
  },
)
