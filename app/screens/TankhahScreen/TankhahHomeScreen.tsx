import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppNavigation } from "app/navigators"
import { ListView, Text } from "app/components"
import { useObject, useQuery, useRealm } from "@realm/react"
import { BSON } from "realm"
import { TankhahItem, OperationType, TankhahGroup } from "app/models/realm/tankhah"
import { PieChart } from "react-native-gifted-charts"
import { formatDateIR, formatDateIRDisplay, tomanFormatter } from "app/utils/formatDate"
import { useNavigation } from "@react-navigation/native"
import { AppTabScreenProps } from "app/navigators/AppTabNavigator"
import { Chip, Icon, Button, useTheme, FAB, Menu, Appbar, List, Divider, Drawer } from "react-native-paper"
import { DatePicker } from "app/components/DatePicker/DatePicker"
import { ListRenderItemInfo } from "@shopify/flash-list"
import Reanimated, { BounceIn, FadeInRight, FadeOut, FadeOutRight } from "react-native-reanimated"
import { TxKeyPath, translate } from "app/i18n"
import { $row, spacing } from "app/theme"
import { iconMap, OperationEnum, useStores } from "app/models"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { startOfDay, endOfDay } from "date-fns-jalali"
import randomColor from "randomcolor"
import Animated from "react-native-reanimated"

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
    const safeArea = useSafeAreaInsets()

    const [openFilterMenu, setOpenFilterMenu] = useState(false)
    const [fabOpen, setFabOpen] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)

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
        query = "group.name == $2 AND " + query
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
    const totalFund = useQuery({
      type: TankhahItem, query: (items) => {
        return items.filtered('opType == "fund"')
      }
    }).sum("total")
    const totalSpend = useQuery({
      type: TankhahItem, query: (items) => {
        return items.filtered('opType != "fund"')
      }
    }).sum("total")
    const spendGroupsNames = useQuery({
      type: TankhahGroup,
      query: (item) => item.filtered("active == $0", true).sorted("order")
    }).map((i) => i.name || "no_group")

    const groupNames: string[] = useMemo<string[]>(
      () => ["all", ...spendGroupsNames],
      [spendGroupsNames],
    )

    const tankhahItemList = useQuery({
      type: TankhahItem,
      query: (items) => {
        const groupName = groupNames && groupNames[selectedGroup]
        const list = items.filtered(...getQueryString(startDate, endDate, selectedOp, groupName))
        return list.sorted('doneAt', true)
      }
    },
      [groupNames, selectedGroup],
    )

    const pieCharColors = useMemo(() => {
      const colors = randomColor({
        hue: theme.colors.primary,
        count: spendGroupsNames.length,
        luminosity: "bright",
      })
      return colors.map((i: string) => ({ color: i }))
    }, [spendGroupsNames.length])

    const renderFilterMenu = useCallback(() => {
      return (
        <Menu
          visible={openFilterMenu}
          onDismiss={handleToggleFilterMenu}
          anchor={
            <Button
              style={$controlsBtn}
              textColor={theme.colors.primary}
              onPress={handleToggleFilterMenu}
              icon="filter"
            >
              {translate(("opType." + selectedOp) as TxKeyPath)}
            </Button>
          }
        >
          {Object.keys(OperationEnum).map((i) => (
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
        if (res && total > 0) {
          pieData.push({
            ...pieCharColors[index],
            value: (res * 100) / total,
            focused: index + 1 === selectedGroup,
          })
        }
      }
      return (
        <View style={{ flexDirection: "column", justifyContent: "space-around" }}>
          {pieData.length > 0 && <PieChart
            data={pieData}
            sectionAutoFocus
            radius={70}
            innerCircleColor={theme.colors.primary}
            showValuesAsLabels
          />}
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text variant="bodyLarge">
              {tomanFormatter(tankhahItemList.filtered('opType != "fund"').sum("total"))}
            </Text>
          </View>
        </View>
      )
    }, [spendGroupsNames, startDate, endDate, selectedGroup])

    const renderItem = (item: TankhahItem) => {
      const icon = iconMap[item.opType]
      const mapDescription = {
        fund: `دریافت`,
        buy: `${item.receiptItems?.map((i) => `${i.title}`).join("، ")}`,
        transfer: `${translate("paymentMethod." + item.paymentMethod as TxKeyPath)} به ${item.recipient || item.accountNum || "نامشخص"}`,
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

    const renderTimeRangeBtn = (
      type: "start" | "end" = "start",
      open: () => void,
      value?: Date,
    ) => {
      return (
        <Button
          onPress={open}
        >
          {(type === "start" ? " از " : "تا ") + (value ? formatDateIRDisplay(value, "dd MMM yy") : " : ")}
        </Button>
      )
    }

    const renderDrawer = () => (
      <Animated.View entering={FadeInRight} exiting={FadeOutRight} style={[{ top: 50, position: "absolute", backgroundColor: theme.colors.background }]}>
        <Drawer.CollapsedItem focusedIcon="printer" onPress={handleNavigation("Print")} />
        <Drawer.CollapsedItem focusedIcon="basket" onPress={handleNavigation("ReceiptItemList", {})} />
        <Drawer.CollapsedItem focusedIcon="file-tree" onPress={handleNavigation("TankhahGroupList", {})} />
        <Drawer.CollapsedItem focusedIcon="content-save-move" onPress={handleNavigation("Backup")} />
        <Drawer.CollapsedItem focusedIcon="archive" onPress={handleNavigation("TankhahArchive")} />
        <Drawer.CollapsedItem focusedIcon="magnify" onPress={handleNavigation("TankhahSearch")} />
        <Drawer.CollapsedItem focusedIcon="share-variant-outline" onPress={handleNavigation("ShareIntent")} />
      </Animated.View >
    )


    const handleNavigation = (path: string, params?: any) => () => {
      // @ts-ignore
      navigation.navigate(path, params)
      setDrawerOpen(false)
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
        <Appbar mode="small" safeAreaInsets={{ top: safeArea.top }}>
          <Appbar.Action icon={"menu"} onPress={() => setDrawerOpen((prev) => !prev)} />
          <Appbar.Content
            titleStyle={{ fontSize: 16 }}
            mode="small"
            title={tomanFormatter(totalFund - totalSpend)}
          />

        </Appbar>
        <View>
          <View style={$row}>
            <View>
              <Button
                style={$controlsBtn}
                compact
                onPress={() => {
                  setProp("startDate", startOfDay(new Date()))
                  setProp("endDate", endOfDay(new Date()))
                }}
              >
                {"امروز " + formatDateIRDisplay(new Date())}
              </Button>
              <View style={$row}>
                <DatePicker
                  date={startDate}
                  maxDate={endDate}
                  onDateChange={(value) => {
                    setProp("startDate", value)
                  }}
                  action={({ open, close, value }) => {
                    return renderTimeRangeBtn("start", open, value)
                  }}
                />
                <DatePicker
                  date={endDate}
                  minDate={startDate}
                  onDateChange={(value) => {
                    setProp("endDate", value)
                  }}
                  action={({ open, close, value }) => renderTimeRangeBtn("end", open, value)}
                />
              </View>
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
                        color={pieCharColors[index - 1]?.color || theme.colors.background}
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
          color={theme.colors.primary}
          style={{ position: "absolute", bottom: 40, right: 20 }}
        />
        {drawerOpen && renderDrawer()}
      </>
    )
  },
)

const $controlsBtn: ViewStyle = { margin: spacing.xxs }
