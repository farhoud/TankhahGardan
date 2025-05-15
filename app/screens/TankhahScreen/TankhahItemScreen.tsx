import React, { FC, useLayoutEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps, AppNavigation } from "app/navigators"
import { AutoImage, Button, EmptyState, Screen, Text } from "app/components"
import { CommonActions, useNavigation } from "@react-navigation/native"
import { TankhahItem } from "app/models/realm/tankhah"
import { useObject, useRealm } from "@realm/react"
import { formatDateIR, tomanFormatter } from "app/utils/formatDate"
import { BSON } from "realm"
import { TouchableOpacity } from "react-native-gesture-handler"
import { Appbar, Dialog, Modal, Portal, Surface } from "react-native-paper"
import { TxKeyPath } from "app/i18n"

export const TankhahItemScreen: FC<AppStackScreenProps<"TankhahItem">> = observer(
  function TankhahItemScreen(_props) {
    const itemId = _props.route.params.itemId
    const [confirmVisible, setConfirmVisible] = useState(false)
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    // Pull in navigation via hook
    const navigation = useNavigation<AppNavigation>()

    const tankhahItem = useObject(TankhahItem, new BSON.ObjectID(itemId))

    const realm = useRealm()

    const dismissConfirm = () => {
      setConfirmVisible(false)
    }

    const handleDelete = () => {
      realm.write(() => {
        return realm.delete(tankhahItem)
      })
      goBack()
    }

    const renderConfirm = () => (
      <Portal>
        <Dialog visible={confirmVisible} onDismiss={dismissConfirm}>
          <Dialog.Content>
            <Text>آیا از پاک کردن ایتم مطمئن هستید راه برگشتی نیست؟</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDelete}>بله</Button>
            <Button onPress={dismissConfirm}>خیر</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )

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

    const goToEdit = () => {
      if (tankhahItem?.opType === "fund") {
        navigation.navigate("TankhahFundForm", { itemId })
        return
      }
      navigation.navigate("TankhahSpendForm", { itemId })
    }

    const showConfirm = () => {
      setConfirmVisible(true)
    }

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Appbar.Header>
            <Appbar.BackAction onPress={goBack} />
            <Appbar.Content title="خرج" />
            <Appbar.Action icon="delete" onPress={showConfirm} />
            <Appbar.Action icon="pencil" onPress={goToEdit} />
          </Appbar.Header>
        ),
      })
    }, [])

    if (!tankhahItem) {
      return <EmptyState headingTx="common.not_found"></EmptyState>
    }
    return (
      <Screen style={$root} safeAreaEdges={["bottom"]} preset="scroll">
        <Surface style={$root}>
          <View style={$row}>
            <Text tx="spend.doneAt" />
            <Text text={formatDateIR(tankhahItem.doneAt)} />
          </View>
          <View style={$row}>
            <Text tx="spend.group" />
            <Text text={tankhahItem?.group?.name || "ندارد"} />
          </View>
          <View style={$row}>
            <Text tx="spend.opType" />
            <Text tx={("opType." + tankhahItem.opType) as TxKeyPath} />
          </View>
          <View style={$row}>
            <Text tx="spend.amount" />
            <Text text={tomanFormatter(tankhahItem.amount ?? 0)} />
          </View>
          <View style={$row}>
            <Text tx="spend.paymentMethod" />
            <Text tx={("paymentMethod." + tankhahItem.paymentMethod) as TxKeyPath} />
          </View>
          {!["cash", "pos"].includes(tankhahItem.paymentMethod) && (
            <>
              {!!tankhahItem.recipient && (
                <View style={$row}>
                  <Text tx="spend.recipient" />
                  <Text text={tankhahItem.recipient} />
                </View>
              )}
              {!!tankhahItem.accountNum && (
                <View style={$row}>
                  <Text tx="spend.accountNum" />
                  <Text text={tankhahItem.accountNum} />
                </View>
              )}
              {!!tankhahItem.transferFee && (
                <View style={$row}>
                  <Text tx="spend.transferFee" />
                  <Text text={tomanFormatter(tankhahItem.transferFee)} />
                </View>
              )}
              {!!tankhahItem.trackingNum && (
                <View style={$row}>
                  <Text tx="spend.trackingNum" />
                  <Text text={tankhahItem.trackingNum} />
                </View>
              )}
            </>
          )}
          {!!tankhahItem.description && (
            <View style={$row}>
              <Text tx="spend.description" />
              <Text text={tankhahItem.description || "ندارد"} />
            </View>
          )}
          {!!tankhahItem.receiptItems && tankhahItem.receiptItems.length > 0 && (
            <>
              <View style={$row}>
                <Text tx="spend.items" />
              </View>
              <View style={{ paddingHorizontal: 20 }}>
                {tankhahItem.receiptItems.map((i) => (
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
            <Text text={tomanFormatter(tankhahItem.total ?? 0)} />
          </View>
          {!!tankhahItem.attachments?.length && (
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
                {tankhahItem.attachments.map((uri, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        tankhahItem.attachments &&
                          navigation.navigate("ImageView", {
                            images: tankhahItem.attachments,
                            index,
                          })
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
        {renderConfirm()}
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
