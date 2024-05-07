import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { Animated, ViewStyle } from "react-native"
import { ListView, Screen, Text } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { useQuery, useRealm } from "@realm/react"
import { Fund } from "app/models/realm/models"
import { formatDateIR, tomanFormatter } from "app/utils/formatDate"
import { StackNavigation } from "app/navigators"
import { Appbar, Divider, FAB, IconButton, List, useTheme } from "react-native-paper"
import { TankhahTabScreenProps } from "app/navigators/TankhahTabNavigator"
import { RectButton, Swipeable } from "react-native-gesture-handler"
// import { useStores } from "app/models"

type AnimatedInterpolation = Animated.AnimatedInterpolation<string | number>

export const TankhahChargeListScreen: FC<TankhahTabScreenProps<"ChargeList">> = observer(
  function TankhahChargeListScreen() {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()
    const funds = useQuery(Fund)

    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigation>()
    const theme = useTheme()
    const realm = useRealm()

    const renderItemActions =
      (item: Fund) => (progress: AnimatedInterpolation, dragX: AnimatedInterpolation) => {
        const trans = dragX.interpolate({
          inputRange: [0, 50, 100, 101],
          outputRange: [0, 5, 10, 15],
        })
        return (
          <RectButton
            style={{
              backgroundColor: theme.colors.surfaceVariant,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => {
              realm.write(() => {
                realm.delete(item)
              })
            }}
          >
            <IconButton animated icon="delete"></IconButton>
          </RectButton>
        )
      }

    return (
      <>
        <Appbar.Header>
          <Appbar.Content title={"شارژها"} />
        </Appbar.Header>
        <Screen style={$root} preset="fixed">
          <ListView
            data={funds.slice(0, funds.length)}
            renderItem={({item}) => {
              return (
                <>
                  <Swipeable
                    key={item._objectKey()}
                    renderLeftActions={renderItemActions(item)}
                    renderRightActions={renderItemActions(item)}
                    // leftThreshold={160}
                    // rightThreshold={160}
                  >
                    <List.Item
                      onPress={() => {
                        navigation.navigate("ChargeForm", { itemId: item._id.toHexString() })
                      }}
                      title={tomanFormatter(item.amount)}
                      description={item.description}
                      right={() => (
                        <>{<Text variant="labelMedium">{formatDateIR(item.doneAt)}</Text>}</>
                      )}
                    ></List.Item>
                    <Divider />
                  </Swipeable>
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
