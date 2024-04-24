import React, { FC, useLayoutEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps, StackNavigation } from "app/navigators"
import { AutoImage, Header, Screen, Text } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { Spend } from "app/models/realm/models"
import { useObject } from "@realm/react"
import { currencyFormatter, formatDataIR } from "app/utils/formatDate"
import { BSON } from "realm"
import ImageView from "react-native-image-viewing"
import { TouchableOpacity } from "react-native-gesture-handler"
import { SpendStackScreenProps } from "app/navigators/SpendNavigator"
// import { useStores } from "app/models"

export const TankhahSpendItemScreen: FC<SpendStackScreenProps<"TankhahSpendItem">> = observer(
  function TankhahSpendItemScreen(_props) {
    const itemId = _props.route.params.itemId
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()
    const [visible, setVisible] = useState(false)

    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigation>()

    const spend = useObject(Spend, new BSON.ObjectID(itemId))

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Header
            title="خرج"
            leftIcon="back"
            onLeftPress={() => navigation.goBack()}
            rightTx="common.edit"
            onRightPress={() => {
              navigation.navigate("Demo", {
                screen: "SpendStack",
                params: {
                  screen: "TankhahSpendForm",
                  params: { itemId: spend?._id.toHexString() },
                },
              })
            }}
          />
        ),
      })
    }, [])

    return (
      <Screen style={$root} preset="scroll" safeAreaEdges={["bottom"]}>
        <View style={$row}>
          <Text tx="spend.doneAt" />
          <Text text={spend?.doneAt && formatDataIR(spend?.doneAt)} />
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
        {spend?.paymentMethod !== "cash" && (
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
        )}
        <View style={$row}>
          <Text tx="spend.description" />
          <Text text={spend?.description || "ندارد"} />
        </View>
        <View style={$row}>
          <Text tx="spend.group" />
          <Text text={spend?.group || "ندارد"} />
        </View>
        <View style={$row}>
          <Text tx="spend.total" />
          <Text text={currencyFormatter.format(spend?.total ?? 0)} />
        </View>
        <View style={$row}>
          <Text tx="spend.attachments" />
          <Text></Text>
        </View>
        {spend?.attachments?.length ? (
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
        ) : (
          <Text text={"ندارد"} />
        )}
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
