import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { ListView, Screen, Text } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { useQuery } from "@realm/react"
import { Fund } from "app/models/realm/models"
import { currencyFormatter, formatDateIR } from "app/utils/formatDate"
import { StackNavigation } from "app/navigators"
import { Appbar, Divider, FAB, List } from "react-native-paper"
import { TankhahTabScreenProps } from "app/navigators/TankhahTabNavigator"
// import { useStores } from "app/models"

export const TankhahChargeListScreen: FC<TankhahTabScreenProps<"ChargeList">> = observer(
  function TankhahChargeListScreen() {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()
    const funds = useQuery(Fund)

    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigation>()
    const [showIndex, setShowIndex] = useState<undefined | number>()

    return (
      <>
        <Appbar.Header>
          <Appbar.Content title={"شارژها"} />
        </Appbar.Header>
        <Screen style={$root} preset="fixed">
          <ListView
            data={funds.slice(0, funds.length)}
            renderItem={(info) => {
              return (
                <>
                  <List.Item
                    onPress={() => {
                      navigation.navigate("ChargeForm", { itemId: info.item._id.toHexString() })
                    }}
                    title={currencyFormatter.format(info.item.amount)}
                    description={info.item.description}
                    right={() => (
                      <>{<Text variant="labelMedium">{formatDateIR(info.item.doneAt)}</Text>}</>
                    )}
                  ></List.Item>
                  <Divider />
                </>
              )
            }}
          ></ListView>
        </Screen>
        <FAB
          style={{ position: "absolute", bottom: 0, left: 0, margin: 16 }}
          onPress={() => {
            navigation.navigate("ChargeForm", {})
          }}
          icon="plus"
        >
          {/* <Icon icon={"add"}></Icon> */}
        </FAB>
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
