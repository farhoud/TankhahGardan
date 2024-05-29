import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { TouchableOpacity, View, ViewStyle, Animated } from "react-native"
import { StackNavigation } from "app/navigators"
import { ListView, Screen, Text } from "app/components"
import { useObject, useQuery, useRealm } from "@realm/react"
import { BSON } from "realm"
import { TankhahItem, OperationType } from "app/models/realm/models"
import { subMonths, addDays } from "date-fns"
import { PieChart } from "react-native-gifted-charts"
import { formatDateIR, tomanFormatter } from "app/utils/formatDate"
import { useNavigation } from "@react-navigation/native"
import { AppTabScreenProps } from "app/navigators/AppTabNavigator"
import {
  Chip,
  Surface,
  Icon,
  Button,
  useTheme,
  FAB,
  IconButton,
  Menu,
  Appbar,
} from "react-native-paper"
import { DatePicker } from "app/components/DatePicker/DatePicker"
import { ListRenderItemInfo } from "@shopify/flash-list"
import Reanimated, { BounceIn, FadeOut } from "react-native-reanimated"
import { RectButton, Swipeable } from "react-native-gesture-handler"
import { TxKeyPath, translate } from "app/i18n"
import { usePrint } from "app/utils/usePrint"

const PieCharColors = [
  { color: "#009FFF", gradientCenterColor: "#006DFF" },
  { color: "#93FCF8", gradientCenterColor: "#3BE9DE" },
  { color: "#BDB2FA", gradientCenterColor: "#8F80F3" },
  { color: "#FFA5BA", gradientCenterColor: "#FF7F97" },
  { color: "#FFD700", gradientCenterColor: "#FFA500" },
  { color: "#7FFF00", gradientCenterColor: "#32CD32" },
  { color: "#00FF7F", gradientCenterColor: "#00FF00" },
  { color: "#FF6347", gradientCenterColor: "#FF4500" },
  { color: "#DA70D6", gradientCenterColor: "#BA55D3" },
  { color: "#4682B4", gradientCenterColor: "#1E90FF" },
  { color: "#FF8C00", gradientCenterColor: "#FF4500" },
  { color: "#ADFF2F", gradientCenterColor: "#7FFF00" },
  { color: "#BA55D3", gradientCenterColor: "#9370DB" },
  { color: "#FF1493", gradientCenterColor: "#FF69B4" },
]

enum FilterEnum {
  all = "all",
  buy = "buy",
  transfer = "transfer",
  fund = "fund",
}

type AnimatedInterpolation = Animated.AnimatedInterpolation<string | number>
type ItemFilterPreset = OperationType | "all" | "not_spend"

export const TankhahHomeScreen: FC<AppTabScreenProps<"TankhahHome">> = observer(
  function TankhahHomeScreen(_props) {
    const itemId = _props.route.params?.itemId

    const navigation = useNavigation<StackNavigation>()
    const theme = useTheme()
    const realm = useRealm()
    const printer = usePrint()

    const [startDate, setStartDate] = useState(subMonths(new Date(), 1))
    const [endDate, setEndDate] = useState(addDays(new Date(), 1))
    const [selectedGroup, setSelectedGroup] = useState(0)
    const [selectedFilter, setSelectedFilter] = useState<ItemFilterPreset>("all")
    const [openFilterMenu, setOpenFilterMenu] = useState(false)
    const [fabOpen, setFabOpen] = useState(false)

    const getQueryString = (
      startDate: Date,
      endDate: Date,
      filter: ItemFilterPreset,
      group?: string,
    ): [string, ...Array<Date | string>] => {
      const baseQuery = "doneAt BETWEEN { $0 , $1 } SORT(doneAt DESC)"
      let query = baseQuery
      const args: Array<Date | string> = [startDate, endDate]
      switch (filter) {
        case "fund":
        case "buy":
        case "transfer":
          query = `opType == "${filter}" AND ` + query
          break
        case "all":
          break
        default:
          query = 'opType != "fund" AND ' + query
      }
      if (group && group !== "all") {
        query = "group == $2 AND " + query
        args.push(group)
      }
      return [query, ...args]
    }

    const handleToggleFilterMenu = () => {
      setOpenFilterMenu((prev) => !prev)
    }
    const selectFilter = (i: ItemFilterPreset) => () => {
      setSelectedFilter(i)
      setOpenFilterMenu(false)
    }

    const totalFund = useQuery(TankhahItem, (items) => {
      return items.filtered('opType == "fund"')
    }).sum("total")
    const totalSpend = useQuery(TankhahItem, (items) => {
      return items.filtered('opType != "fund"')
    }).sum("total")
    const spendGroupsNames = useQuery(TankhahItem, (spends) =>
      spends.filtered('group CONTAINS "" AND opType != "fund" DISTINCT(group)'),
    ).map((i) => i.group || "no_group")

    const groupNames: string[] = useMemo<string[]>(
      () => ["all", ...spendGroupsNames],
      [spendGroupsNames],
    )

    const tankhahItemList = useQuery(
      TankhahItem,
      (items) => {
        const groupName = groupNames && groupNames[selectedGroup]
        return items.filtered(...getQueryString(startDate, endDate, selectedFilter, groupName))
      },
      [groupNames, selectedGroup],
    )

    const renderFilterMenu = useCallback(() => {
      return (
        <Menu
          visible={openFilterMenu}
          onDismiss={handleToggleFilterMenu}
          anchor={
            <Button
              style={{ marginTop: 10 }}
              mode="contained-tonal"
              onPress={handleToggleFilterMenu}
              icon="filter"
            >
              {translate(("opType." + selectedFilter) as TxKeyPath)}
            </Button>
          }
        >
          {Object.keys(FilterEnum).map((i) => (
            <Menu.Item
              key={i}
              onPress={selectFilter(i as ItemFilterPreset)}
              title={translate(("opType." + i) as TxKeyPath)}
            />
          ))}
        </Menu>
      )
    }, [openFilterMenu, selectedFilter])

    const renderSpendsChart = useCallback(() => {
      let pieData = []
      const total = realm
        .objects(TankhahItem)
        .filtered(...getQueryString(startDate, endDate, "fund"))
        .sum("total")
      for (const [index, item] of spendGroupsNames.entries()) {
        const res = realm
          .objects(TankhahItem)
          .filtered(...getQueryString(startDate, endDate, "not_spend", item))
          .sum("total")
        if (res && total) {
          pieData.push({
            ...PieCharColors[index],
            value: (res * 100) / total,
            focused: index + 1 === selectedGroup,
          })
        }
      }
      return (
        <PieChart
          data={pieData}
          donut
          showGradient
          sectionAutoFocus
          radius={100}
          innerRadius={80}
          innerCircleColor={"#232B5D"}
          showValuesAsLabels
          centerLabelComponent={() => {
            return (
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 22, color: "white", fontWeight: "bold" }}>
                  {tomanFormatter(tankhahItemList.filtered('opType != "fund"').sum("total"))}
                </Text>

                <Text style={{ fontSize: 14, color: "white" }} text="مخارج " />
              </View>
            )
          }}
        />
      )
    }, [spendGroupsNames, startDate, endDate, selectedGroup])

    const renderItemActions =
      (item: TankhahItem) => (progress: AnimatedInterpolation, dragX: AnimatedInterpolation) => {
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

    const renderSpendItem = (item: TankhahItem) => {
      return (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("TankhahSpendItem", {
              itemId: item._id.toHexString(),
            })
          }}
          onLongPress={() => {
            navigation.navigate("TankhahSpendForm", {
              itemId: item._id.toHexString(),
            })
          }}
        >
          <Surface
            style={{
              // display: "flex",
              // elevation: 5,
              // margin: 2,
              paddingHorizontal: 20,
              paddingVertical: 10,
              marginBottom: 2,
              // backgroundColor: "#EAEAEA",
            }}
            elevation={2}
          >
            <View style={$detail}>
              <Text
                style={{
                  color: item.opType === "fund" ? theme.colors.primary : theme.colors.tertiary,
                }}
                variant="labelMedium"
                tx={("opType." + item.opType) as TxKeyPath}
              />
              <Text variant="labelMedium">{formatDateIR(item.doneAt)}</Text>
            </View>
            {item.opType === "transfer" && (
              <View style={$detail}>
                <Text variant="labelMedium">دریافت کننده</Text>
                <Text>{item.recipient ?? "ثبت نشده"}</Text>
              </View>
            )}
            {item.opType === "buy" && (
              <View style={$detail}>
                <Text variant="labelMedium">اجناس</Text>
                <Text>{item.receiptItems?.map((i) => `${i.title}`).join("، ") || "ثبت نشده"}</Text>
              </View>
            )}
            {item.opType === "fund" && !!item.description && (
              <View style={$detail}>
                <Text variant="labelMedium">توضیحات</Text>
                <Text>{item.description}</Text>
              </View>
            )}
            <View style={$detail}>
              <Text variant="labelMedium">مبلغ</Text>
              <Text variant="bodyLarge">{tomanFormatter(item.amount)}</Text>
            </View>
          </Surface>
        </TouchableOpacity>
      )
    }

    const renderListItem = ({ item }: ListRenderItemInfo<TankhahItem>) => {
      return (
        <Swipeable
          key={item._objectKey()}
          renderLeftActions={renderItemActions(item)}
          renderRightActions={renderItemActions(item)}
          // leftThreshold={160}
          // rightThreshold={160}
        >
          {renderSpendItem(item)}
        </Swipeable>
      )
    }
    const headItem = useObject(TankhahItem, new BSON.ObjectID(itemId))
    const renderHeadItem = () => {
      if (headItem) {
        return (
          <Reanimated.View entering={BounceIn} exiting={FadeOut}>
            {renderSpendItem(headItem)}
          </Reanimated.View>
        )
      }
      return undefined
    }
    useEffect(() => {
      if (itemId) {
        setTimeout(() => {
          navigation.setParams({ itemId: undefined })
        }, 3000)
      }
      return () => navigation.setParams({ itemId: undefined })
    }, [])

    return (
      <>
        <Screen style={$root} safeAreaEdges={["top", "bottom"]} preset="fixed">
          <View>
            <Appbar>
              <Appbar.Content titleStyle={{fontSize:18}} mode="small" title={tomanFormatter(totalFund - totalSpend)} />
              <Appbar.Action
                icon={"printer"}
                onPress={() =>
                  printer.printTankhah(
                    tankhahItemList.map((i) => {
                      return {
                        date: formatDateIR(i.doneAt),
                        opType: i.opType === "fund" ? "واریز" : "برداشت",
                        amount: i.amount.toString(),
                        description: !!i.description
                          ? i.description
                          : i.receiptItems?.map((j) => `${j.amount?.toString()} * ${j.title}`).join(" "),
                      }
                    }),
                  )
                }
              />
            </Appbar>
            <Surface>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <View
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingLeft: 10,
                  }}
                >
                  <DatePicker
                    date={startDate}
                    maxDate={endDate}
                    onDateChange={(value) => {
                      setStartDate(value)
                    }}
                    action={({ open, close, value }) => {
                      return (
                        <Button
                          icon={(props) => (
                            <Icon
                              source="calendar-start"
                              size={26}
                              color={theme.colors.inverseSurface}
                            />
                          )}
                          dark={false}
                          mode="contained-tonal"
                          onPress={open}
                        >
                          <Text
                            variant="bodyLarge"
                            style={{ textAlign: "center" }}
                            text={formatDateIR(value)}
                          />
                        </Button>
                      )
                    }}
                  />
                  <DatePicker
                    date={endDate}
                    minDate={startDate}
                    onDateChange={(value) => {
                      setEndDate(value)
                    }}
                    action={({ open, close, value }) => {
                      return (
                        <Button
                          style={{ marginTop: 10 }}
                          icon={(props) => (
                            <Icon
                              source="calendar-end"
                              size={26}
                              color={theme.colors.inverseSurface}
                            />
                          )}
                          mode="contained-tonal"
                          onPress={open}
                        >
                          <Text
                            variant="bodyLarge"
                            style={{ textAlign: "center" }}
                            text={formatDateIR(value)}
                          />
                        </Button>
                      )
                    }}
                  />
                  {renderFilterMenu()}
                </View>
                {renderSpendsChart()}
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                {groupNames.map((i, index) => {
                  return (
                    <View key={index} style={{ margin: 2 }}>
                      <Chip
                        textStyle={{ fontSize: 10 }}
                        maxFontSizeMultiplier={1}
                        showSelectedOverlay
                        selected={index === selectedGroup}
                        // style={{ width: "100%" }}
                        onPress={() => {
                          setSelectedGroup(index)
                        }}
                        icon={(props) => (
                          <Icon
                            {...props}
                            source={index === selectedGroup ? "check-circle" : "circle"}
                            size={10}
                            color={PieCharColors[index - 1]?.color || theme.colors.background}
                          />
                        )}
                      >
                        {i === "all" ? "همه" : i}
                      </Chip>
                    </View>
                  )
                })}
              </View>
            </Surface>
          </View>

          <View style={{ height: "61%" }}>
            <ListView
              // contentContainerStyle={{flexGrow:1}}
              keyExtractor={(i) => i._objectKey()}
              data={tankhahItemList.filter((i) => i._id.toHexString() !== itemId)}
              ListHeaderComponent={renderHeadItem}
              renderItem={renderListItem}
            ></ListView>
          </View>
        </Screen>
        <FAB.Group
          open={fabOpen}
          visible
          icon={fabOpen ? "cash-fast" : "plus"}
          actions={[
            {
              icon: "wallet-plus",
              label: "شارژ تنخواه",
              onPress: () => navigation.navigate("ChargeForm", {}),
            },
            {
              icon: "cash-fast",
              label: "خرج",
              onPress: () => navigation.navigate("TankhahSpendForm", {}),
            },
          ]}
          onStateChange={({ open }) => {
            setFabOpen(open)
          }}
          onPress={() => {
            if (fabOpen) {
              navigation.navigate("TankhahSpendForm", {})
              // do something if the speed dial is open
            }
          }}
        />
      </>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
  // marginTop: 50,
}

const $detail: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  alignContent: "center",
  justifyContent: "space-between",
  margin: 5,
  // padding: 20
}
