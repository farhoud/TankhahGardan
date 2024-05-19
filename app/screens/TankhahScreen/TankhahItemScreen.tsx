import React, { FC, useLayoutEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps, StackNavigation } from "app/navigators"
import { AutoImage, EmptyState, Screen, Text } from "app/components"
import { CommonActions, useNavigation } from "@react-navigation/native"
import { TankhahItem } from "app/models/realm/models"
import { useObject } from "@realm/react"
import { formatDateIR, tomanFormatter } from "app/utils/formatDate"
import { BSON } from "realm"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Appbar, Surface } from "react-native-paper"
import { TxKeyPath } from "app/i18n"

export const TankhahSpendItemScreen: FC<AppStackScreenProps<"TankhahSpendItem">> = observer(
  function TankhahSpendItemScreen(_props) {
    const itemId = _props.route.params.itemId
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigation>()

    const spend = useObject(TankhahItem, new BSON.ObjectID(itemId))

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
      if(spend?.opType==="fund"){
        navigation.navigate("ChargeForm", { itemId })
        return
      }
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

    if (!spend) {
      return <EmptyState headingTx="common.not_found"></EmptyState>
    }
    return (
      <Screen style={$root} safeAreaEdges={["bottom"]} preset="scroll">
        <Surface style={$root}>
          <View style={$row}>
            <Text tx="spend.doneAt" />
            <Text text={formatDateIR(spend.doneAt)} />
          </View>
          <View style={$row}>
            <Text tx="spend.group" />
            <Text text={spend?.group || "ندارد"} />
          </View>
          <View style={$row}>
            <Text tx="spend.opType" />
            <Text tx={("opType." + spend.opType) as TxKeyPath} />
          </View>
          <View style={$row}>
            <Text tx="spend.amount" />
            <Text text={tomanFormatter(spend.amount ?? 0)} />
          </View>
          <View style={$row}>
            <Text tx="spend.paymentMethod" />
            <Text tx={("paymentMethod." + spend.paymentMethod) as TxKeyPath} />
          </View>
          {!["cash", "pos"].includes(spend.paymentMethod) && (
            <>
              {spend.recipient && (
                <View style={$row}>
                  <Text tx="spend.recipient" />
                  <Text text={spend.recipient} />
                </View>
              )}
              {spend.accountNum && (
                <View style={$row}>
                  <Text tx="spend.accountNum" />
                  <Text text={spend.accountNum} />
                </View>
              )}
              {spend.transferFee && (
                <View style={$row}>
                  <Text tx="spend.transferFee" />
                  <Text text={tomanFormatter(spend.transferFee)} />
                </View>
              )}
              {spend.trackingNum && (
                <View style={$row}>
                  <Text tx="spend.trackingNum" />
                  <Text text={spend.trackingNum} />
                </View>
              )}
            </>
          )}
          {spend.description && (
            <View style={$row}>
              <Text tx="spend.description" />
              <Text text={spend.description || "ندارد"} />
            </View>
          )}
          {spend.receiptItems && spend.receiptItems.length > 0 && (
            <>
              <View style={$row}>
                <Text tx="spend.items" />
              </View>
              <View style={{ paddingHorizontal: 20 }}>
                {spend.receiptItems.map((i) => (
                  <View style={$row} key={i._objectKey()}>
                    <Text text={i.title} />
                    <Text text={`${i.amount} X ${i.price}`} />
                  </View>
                ))}
              </View>
            </>
          )}
          <View style={$row}>
            <Text tx="spend.total" />
            <Text text={tomanFormatter(spend.total ?? 0)} />
          </View>
          {!!spend.attachments?.length && (
            <>
              <View style={$row}>
                <Text tx="spend.attachments" />
              </View>
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
                {spend.attachments.map((uri, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        spend.attachments &&
                          navigation.navigate("ImageView", { images: spend.attachments, index })
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
            </>
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

