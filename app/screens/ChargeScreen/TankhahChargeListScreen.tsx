import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { Button, Header, Icon,ListView, Screen, Text } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { useQuery } from "@realm/react"
import { Fund } from "app/models/realm/models"
import { format } from "date-fns-jalali"
import { currencyFormatter } from "app/utils/formatDate"
import { TouchableOpacity } from "react-native-gesture-handler"
import { colors } from "app/theme"
import { StackNavigation } from "app/navigators"
import { ChargeStackScreenProps } from "app/navigators/ChargeNavigator"
// import { useStores } from "app/models"

export const TankhahChargeListScreen: FC<ChargeStackScreenProps<"ChargeList">> = observer(
  function TankhahChargeListScreen() {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()
    const funds = useQuery(Fund)

    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigation>()
    const [showIndex, setShowIndex] = useState<undefined | number>()

    return (
      <>
        <Header title="شارژ"></Header>
        <Screen style={$root} preset="fixed">
          <ListView
            data={funds.slice(0, funds.length)}
            renderItem={(info) => {
              return (
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.palette.neutral300,
                    borderBottomWidth: 0.5,
                  }}
                  onPress={() => {
                    setShowIndex((prev) => (prev === info.index ? undefined : info.index))
                  }}
                  onLongPress={() => {
                    navigation.navigate("Demo", {
                      screen: "ChargeStack",
                      params: {
                        screen: "ChargeForm",
                        params: { itemId: info.item._id.toHexString() },
                      },
                    })
                  }}
                >
                  <View style={{ width: "100%" }}>
                    <View style={$detail}>
                      <Text preset="formLabel">تاریخ عملیات</Text>
                      <Text preset="formLabel">{format(info.item.doneAt, "yyyy/MM/dd")}</Text>
                    </View>
                    <View style={$detail}>
                      <Text preset="formLabel">مبلغ</Text>
                      <Text preset="formLabel">{currencyFormatter.format(info.item.amount)}</Text>
                    </View>
                    {showIndex === info.index && (
                      <View style={$detail}>
                        <Text preset="formLabel">توضیحات</Text>
                        <Text preset="formLabel">{info.item.description || "ندارد"}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )
            }}
          ></ListView>
        </Screen>
        <Button
          style={{ position: "absolute", bottom: 10, left: 10, borderRadius: 380 }}
          onPress={() => {
            navigation.navigate("Demo", {
              screen: "ChargeStack",
              params: {
                screen: "ChargeForm",
                params: {},
              },
            })
          }}
        >
          <Icon icon={"add"}></Icon>
        </Button>
      </>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
  // marginTop: 100,
  height: "100%",
}

const $detail: ViewStyle = {
  display: "flex",
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  alignContent: "center",
  justifyContent: "space-between",
  margin: 10,
  // padding: 20
}
