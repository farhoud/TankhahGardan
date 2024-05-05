import React, { FC, useLayoutEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps, StackNavigation } from "app/navigators"
import { AutoImage, Screen, Text } from "app/components"
import { CommonActions, useNavigation } from "@react-navigation/native"
import { Spend } from "app/models/realm/models"
import { useObject } from "@realm/react"
import { currencyFormatter, formatDateIR } from "app/utils/formatDate"
import { BSON } from "realm"
import ImageView from "react-native-image-viewing"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Appbar, Surface } from "react-native-paper"

export const TankhahSpendItemScreen: FC<AppStackScreenProps<"TankhahSpendItem">> = observer(
  function TankhahSpendItemScreen(_props) {
    const itemId = _props.route.params.itemId
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()
    const [visible, setVisible] = useState(false)

    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigation>()

    const spend = useObject(Spend, new BSON.ObjectID(itemId))

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

    const goToEdit = () => {
      navigation.navigate("TankhahSpendForm", { itemId })
    }

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Appbar.Header>
            <Appbar.BackAction onPress={goBack} />
            <Appbar.Content title="خرج" />
            <Appbar.Action icon="pencil" onPress={goToEdit} />
          </Appbar.Header>
        ),
      })
    }, [])

    return (
      <Screen style={$root} preset="scroll">
        <Surface style={$root}>
          <View style={$row}>
            <Text tx="spend.doneAt" />
            <Text text={spend?.doneAt && formatDateIR(spend?.doneAt)} />
          </View>
          <View style={$row}>
            <Text tx="spend.recipient" />
            <Text text={spend?.recipient} />
          </View>
          <View style={$row}>
            <Text tx="spend.amount" />
            <Text text={currencyFormatter.format(spend?.amount ?? 0)} />
          </View>
          <View style={$row}>
            <Text tx="spend.paymentMethod" />
            <Text text={spend?.paymentMethod} />
          </View>
          {spend?.paymentMethod !== "cash" ||
            ("pos" && (
              <>
                <View style={$row}>
                  <Text tx="spend.accountNum" />
                  <Text text={spend?.accountNum || "ندارد"} />
                </View>
                <View style={$row}>
                  <Text tx="spend.transferFee" />
                  <Text text={currencyFormatter.format(spend?.transferFee ?? 0)} />
                </View>
                <View style={$row}>
                  <Text tx="spend.trackingNum" />
                  <Text text={spend?.trackingNum || "ندارد"} />
                </View>
              </>
            ))}
          <View style={$row}>
            <Text tx="spend.description" />
            <Text text={spend?.description || "ندارد"} />
          </View>
          <View style={$row}>
            <Text tx="spend.group" />
            <Text text={spend?.group || "ندارد"} />
          </View>
          {spend?.receiptItems && (
            <>
              <View style={$row}>
                <Text tx="spend.items" />
              </View>
              <View style={{ paddingHorizontal: 20 }}>
                {spend.receiptItems.map((i) => (
                  <View style={$row}>
                    <Text text={i.title} />
                    <Text text={`${i.amount} X ${i.price}`} />
                  </View>
                ))}
              </View>
            </>
          )}
          <View style={$row}>
            <Text tx="spend.total" />
            <Text text={currencyFormatter.format(spend?.total ?? 0)} />
          </View>
          <View style={$row}>
            <Text tx="spend.attachments" />
            {spend?.attachments && spend?.attachments?.length === 0 && <Text text={"ندارد"} />}
          </View>
          {!!spend?.attachments && (
            <View
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <ImageView
                images={spend?.attachments.map((i) => {
                  return { uri: i }
                })}
                imageIndex={0}
                visible={visible}
                onRequestClose={() => setVisible(false)}
              />
              {spend.attachments.map((uri, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      // setVisible(true)
                    }}
                  >
                    <AutoImage
                      source={{ uri }}
                      maxHeight={300}
                      maxWidth={350}
                      style={{ padding: 10, margin: 10 }}
                    ></AutoImage>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </Surface>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $row: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  alignContent: "center",
  marginVertical: 10,
  marginHorizontal: 20,
}

const $col: ViewStyle = {}
