import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppNavigation } from "app/navigators"
import { ListView, Text } from "app/components"
import { useObject, useQuery, useRealm } from "@realm/react"
import { BSON } from "realm"
import { TankhahItem, OperationType } from "app/models/realm/models"
import { PieChart } from "react-native-gifted-charts"
import { formatDateIR, tomanFormatter } from "app/utils/formatDate"
import { useNavigation } from "@react-navigation/native"
import { AppTabScreenProps } from "app/navigators/AppTabNavigator"
import {
  Chip,
  Icon,
  Button,
  useTheme,
  FAB,
  Menu,
  Appbar,
  List,
  Divider,
} from "react-native-paper"
import { DatePicker } from "app/components/DatePicker/DatePicker"
import { ListRenderItemInfo } from "@shopify/flash-list"
import Reanimated, { BounceIn, FadeOut } from "react-native-reanimated"
import { TxKeyPath, translate } from "app/i18n"
import { usePrint } from "app/utils/usePrint"
import { $row, spacing } from "app/theme"
import { useStores } from "app/models"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { addYears } from "date-fns"

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

const iconMap = {
  fund: "cash-plus",
  buy: "cash-register",
  transfer: "cash-fast",
}

type ItemFilterPreset = OperationType | "all" | "spend"

export const TankhahHomeScreen: FC<AppTabScreenProps<"TankhahHome">> = observer(
  function TankhahHomeScreen(_props) {
    const itemId = _props.route.params?.itemId

    const {
      tankhahHomeStore: { startDate, endDate, selectedGroup, selectedOp, setProp },
    } = useStores()

    const navigation = useNavigation<AppNavigation>()
    const theme = useTheme()
    const realm = useRealm()
    const printer = usePrint()

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
      setProp("selectedOp", i)
      setOpenFilterMenu(false)
    }

    const headItem = useObject(TankhahItem, new BSON.ObjectID(itemId))
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
        return items.filtered(...getQueryString(startDate, endDate, selectedOp, groupName))
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
              style={$controlsBtn}
              mode="contained-tonal"
              onPress={handleToggleFilterMenu}
              icon="filter"
            >
              {translate(("opType." + selectedOp) as TxKeyPath)}
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
    }, [openFilterMenu, selectedOp])

    const renderPieChart = useCallback(() => {
      let pieData = []
      const total = realm
        .objects(TankhahItem)
        .filtered(...getQueryString(startDate, endDate, "fund"))
        .sum("total")
      for (const [index, item] of spendGroupsNames.entries()) {
        const res = realm
          .objects(TankhahItem)
          .filtered(...getQueryString(startDate, endDate, "spend", item))
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
          radius={80}
          innerRadius={75}
          innerCircleColor={"#232B5D"}
          showValuesAsLabels
          centerLabelComponent={() => {
            return (
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text variant="bodyLarge">
                  {tomanFormatter(tankhahItemList.filtered('opType != "fund"').sum("total"))}
                </Text>
                <Text variant="bodySmall" text="مخارج " />
              </View>
            )
          }}
        />
      )
    }, [spendGroupsNames, startDate, endDate, selectedGroup])

    const renderItem = (item: TankhahItem) => {
      const icon = iconMap[item.opType]
      const mapDescription = {
        fund: `دریافت`,
        buy: `خرید  ${item.receiptItems?.map((i) => `${i.title}`).join("، ")}`,
        transfer: `انتقال وجه ${translate(
          ("paymentMethod." + item.paymentMethod) as TxKeyPath,
        )} به ${item.recipient || item.accountNum || "نامشخص"}`,
      }
      return (
        <List.Item
          unstable_pressDelay={50}
          left={(props) => <List.Icon {...props} icon={icon} />}
          right={() => (
            <View>
              <Text style={{ textAlign: "right" }} variant="labelSmall">
                {formatDateIR(item.doneAt)}
              </Text>
              <Text style={{ textAlign: "right" }}>{tomanFormatter(item.total)}</Text>
            </View>
          )}
          titleStyle={{ fontFamily: "IRANSansXFaNum-Regular", fontSize: 14 }}
          descriptionStyle={{ fontFamily: "IRANSansXFaNum-Regular", fontSize: 12 }}
          title={mapDescription[item.opType]}
          titleNumberOfLines={2}
          description={item.description}
          onPress={() => {
            navigation.navigate("TankhahItem", {
              itemId: item._id.toHexString(),
            })
          }}
          onLongPress={() => {
            if (item?.opType === "fund") {
              navigation.navigate("TankhahFundForm", { itemId })
              return
            }
            navigation.navigate("TankhahSpendForm", { itemId })
          }}
        />
      )
    }

    // const renderItem = (item: TankhahItem) => {
    //   return (
    //     <TouchableOpacity
    //       onPress={() => {
    //         navigation.navigate("TankhahItem", {
    //           itemId: item._id.toHexString(),
    //         })
    //       }}
    //       onLongPress={() => {
    //         if (item?.opType === "fund") {
    //           navigation.navigate("TankhahFundForm", { itemId })
    //           return
    //         }
    //         navigation.navigate("TankhahSpendForm", { itemId })
    //       }}
    //     >
    //       <Surface
    //         style={{
    //           paddingHorizontal: 20,
    //           paddingVertical: 10,
    //           marginBottom: 2,
    //         }}
    //         elevation={2}
    //       >
    //         <View style={$detail}>
    //           <Text
    //             style={{
    //               color: item.opType === "fund" ? theme.colors.primary : theme.colors.tertiary,
    //             }}
    //             variant="labelMedium"
    //             tx={("opType." + item.opType) as TxKeyPath}
    //           />
    //           <Text variant="labelMedium">{formatDateIR(item.doneAt)}</Text>
    //         </View>
    //         {item.opType === "transfer" && (
    //           <View style={$detail}>
    //             <Text variant="labelMedium">دریافت کننده</Text>
    //             <Text>{item.recipient ?? "ثبت نشده"}</Text>
    //           </View>
    //         )}
    //         {item.opType === "buy" && (
    //           <View style={$detail}>
    //             <Text variant="labelMedium">اجناس</Text>
    //             <Text>{item.receiptItems?.map((i) => `${i.title}`).join("، ") || "ثبت نشده"}</Text>
    //           </View>
    //         )}
    //         {item.opType === "fund" && !!item.description && (
    //           <View style={$detail}>
    //             <Text variant="labelMedium">توضیحات</Text>
    //             <Text>{item.description}</Text>
    //           </View>
    //         )}
    //         <View style={$detail}>
    //           <Text variant="labelMedium">مبلغ</Text>
    //           <Text variant="bodyLarge">{tomanFormatter(item.amount)}</Text>
    //         </View>
    //       </Surface>
    //     </TouchableOpacity>
    //   )
    // }

    const renderListItem = ({ item }: ListRenderItemInfo<TankhahItem>) => renderItem(item)

    const renderHeadItem = () => {
      return (
        <>
          {!!headItem && (
            <Reanimated.View entering={BounceIn} exiting={FadeOut}>
              {renderItem(headItem)}
            </Reanimated.View>
          )}
        </>
      )
    }

    const renderTimeRangeBtn = (value: Date, type: "start" | "end" = "start", open: () => void) => {
      return (
        <Button
          style={$controlsBtn}
          icon={(props) => (
            <Icon
              source={type === "start" ? "calendar-start" : "calendar-end"}
              size={26}
              color={theme.colors.inverseSurface}
            />
          )}
          mode="contained-tonal"
          onPress={open}
        >
          {formatDateIR(value)}
        </Button>
      )
    }

    const handlePrint = () => {
      const totalFund = realm
        .objects(TankhahItem)
        .filtered(...getQueryString(startDate, endDate, "fund"))
        .sum("total")
      const totalSpend = realm
        .objects(TankhahItem)
        .filtered(...getQueryString(startDate, endDate, "spend"))
        .sum("total")

      const totalFundAll = realm
        .objects(TankhahItem)
        .filtered(...getQueryString(addYears(startDate, -50), endDate, "fund"))
        .sum("total")
      const totalSpendAll = realm
        .objects(TankhahItem)
        .filtered(...getQueryString(addYears(startDate, -50), endDate, "spend"))
        .sum("total")

      printer.printTankhah(
        tankhahItemList.map((item) => {
          const mapInfo = {
            fund: `دریافت`,
            buy: `خرید  ${item.receiptItems?.map((i) => `${i.title}`).join("، ")}`,
            transfer: `انتقال وجه ${translate(
              ("paymentMethod." + item.paymentMethod) as TxKeyPath,
            )} به ${item.recipient || item.accountNum || "نامشخص"}`,
          }
          return {
            date: formatDateIR(item.doneAt),
            opType: item.opType,
            amount: tomanFormatter(item.amount),
            fee: tomanFormatter(item.transferFee),
            description: item.description || "",
            info: mapInfo[item.opType]
          }
        }),
        tomanFormatter(totalSpend),
        tomanFormatter(totalFund),
        tomanFormatter(totalFundAll-totalSpendAll),
      )
    }

    useEffect(() => {
      if (itemId) {
        setTimeout(() => {
          navigation.setParams({ itemId: undefined })
        }, 3000)
      }
      return () => navigation.setParams({ itemId: undefined })
    }, [])
    const safeArea = useSafeAreaInsets()
    return (
      <>
        <Appbar mode="small" safeAreaInsets={{ top: safeArea.top }}>
          <Appbar.Content
            titleStyle={{ fontSize: 16 }}
            mode="small"
            title={tomanFormatter(totalFund - totalSpend)}
          />
          <Appbar.Action icon={"printer"} onPress={handlePrint} />
        </Appbar>
        <View>
          <View style={$row}>
            <View>
              <DatePicker
                date={startDate}
                maxDate={endDate}
                onDateChange={(value) => {
                  setProp("startDate", value)
                }}
                action={({ open, close, value }) => {
                  return renderTimeRangeBtn(value, "start", open)
                }}
              />
              <DatePicker
                date={endDate}
                minDate={startDate}
                onDateChange={(value) => {
                  setProp("endDate", value)
                }}
                action={({ open, close, value }) => renderTimeRangeBtn(value, "end", open)}
              />
              {renderFilterMenu()}
            </View>
            {renderPieChart()}
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
                    onPress={() => {
                      setProp("selectedGroup", index)
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
        </View>
        <Divider />
        <ListView
          keyExtractor={(i) => i._objectKey()}
          data={tankhahItemList.filter((i) => i._id.toHexString() !== itemId)}
          ListHeaderComponent={renderHeadItem}
          renderItem={renderListItem}
        ></ListView>
        <FAB.Group
          open={fabOpen}
          visible
          icon={fabOpen ? "cash-fast" : "plus"}
          label={fabOpen ? "خرج" : ""}
          actions={[
            {
              icon: "wallet-plus",
              label: "دریافت",
              onPress: () => navigation.navigate("TankhahFundForm", {}),
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
          style={{ position: "absolute", bottom: 40, right: 20 }}
        />
      </>
    )
  },
)

const $detail: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  alignContent: "center",
  justifyContent: "space-between",
  margin: 5,
  // padding: 20
}

const $controlsBtn: ViewStyle = { margin: spacing.xxs }
