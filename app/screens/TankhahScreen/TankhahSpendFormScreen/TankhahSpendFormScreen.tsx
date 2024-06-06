import { View, Image } from "react-native"
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
import { TankhahItem } from "app/models/realm/models"
import { BSON } from "realm"
import { useShareIntentContext } from "expo-share-intent"
import { Button, Text } from "app/components"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { ActivityIndicator, Banner, Dialog, Modal, Portal } from "react-native-paper"

export const TankhahSpendFormScreen: FC<AppStackScreenProps<"TankhahSpendForm">> = observer(
  function TankhahSpendFormScreen(_props) {
    const itemId = _props.route?.params?.itemId
    const spend = useObject(TankhahItem, new BSON.ObjectID(itemId))
    const [index, setIndex] = useState(0)
    const sharedIntentContext = useShareIntentContext()

    const navigation = useNavigation()
    const {
      spendFormStore: {
        opType,
        errors,
        _id,
        setSpend,
        applyShareText,
        loading,
        setProp,
        error: apiError,
        report,
      },
    } = useStores()

    const routes = useMemo(() => {
      if (opType === "buy") {
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
    }, [opType])

    useEffect(() => {
      const { hasShareIntent, shareIntent, resetShareIntent } = sharedIntentContext
      let res
      if (hasShareIntent && shareIntent.text) {
        res = applyShareText(shareIntent.text)
        resetShareIntent()
      }
      if (!res) {
        resetShareIntent()
      }
    }, [sharedIntentContext])

    const renderBanner = () => {
      return (
        <Banner
          visible={!!report}
          actions={[
            {
              label: "باشه",
              onPress: () => setProp("report", undefined),
            },
          ]}
          icon={({ size }) => (
            <Image
              source={{
                uri: "https://avatars3.githubusercontent.com/u/17571969?s=400&v=4",
              }}
              style={{
                width: size,
                height: size,
              }}
            />
          )}
        >
          {report}
        </Banner>
      )
    }

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

    const renderScene = SceneMap({
      step1: BasicFormScreen,
      step2: BuyFormScreen,
      step3: MoneyFormScreen,
    })

    useEffect(() => {
      if (spend && _id !== spend._id.toHexString()) {
        setSpend(spend)
      }
    }, [spend])

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
        {renderBanner()}
        <View
          style={{
            flex: 1,
          }}
        >
          <Portal>
            <Modal visible={loading}>
              <ActivityIndicator animating={true} />
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text variant="bodyMedium">تلاش برای هضم تکست!</Text>
              </View>
            </Modal>
            <Dialog visible={!!apiError}>
              <Dialog.Title>هضم نشد</Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyMedium">{apiError}</Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  tx="common.ok"
                  onPress={() => {
                    setProp("error", undefined)
                  }}
                ></Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            renderTabBar={StepBar}
            tabBarPosition="bottom"
            onIndexChange={setIndex}
          />
        </View>
      </BottomSheetModalProvider>
    )
  },
)
