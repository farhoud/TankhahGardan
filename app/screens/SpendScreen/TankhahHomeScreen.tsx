import React, { FC, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { TouchableOpacity, View, ViewStyle } from "react-native"
import { StackNavigation } from "app/navigators"
import { ListView, Screen, Text } from "app/components"
import { useObject, useQuery, useRealm } from "@realm/react"
import { BSON } from "realm"
import { Fund, Spend } from "app/models/realm/models"
import { colors } from "app/theme"
import { subMonths, addDays } from "date-fns"
import { PieChart } from "react-native-gifted-charts"
import { currencyFormatter, formatDateIR } from "app/utils/formatDate"
import { useNavigation } from "@react-navigation/native"
import { TankhahTabScreenProps } from "app/navigators/TankhahTabNavigator"
import { Chip, Surface, Icon, Button, useTheme, FAB } from "react-native-paper"
import { DatePicker } from "app/components/DatePicker"
import { ListRenderItemInfo } from "@shopify/flash-list"

const PieCharColors = [
  { color: "#009FFF", gradientCenterColor: "#006DFF" },
  { color: "#93FCF8", gradientCenterColor: "#3BE9DE" },
  { color: "#BDB2FA", gradientCenterColor: "#8F80F3" },
  { color: "#FFA5BA", gradientCenterColor: "#FF7F97" },
]

export const TankhahHomeScreen: FC<TankhahTabScreenProps<"TankhahHome">> = observer(
  function TankhahHomeScreen(_props) {
    const itemId = _props.route.params?.itemId
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()
    const navigation = useNavigation<StackNavigation>()
    const theme = useTheme()
    const realm = useRealm()
    const totalFund = useQuery(Fund).sum("amount")
    const totalSpend = useQuery(Spend).sum("total")
    const [startDate, setStartDate] = useState(subMonths(new Date(), 1))
    const [endDate, setEndDate] = useState(addDays(new Date(), 1))
    const groupsNames = useQuery(Spend, (spends) =>
      spends.filtered('group CONTAINS "" DISTINCT(group)'),
    ).map((i) => i.group || "no_group")
    const [selectedGroup, setSelectedGroup] = useState(-1)

    const getQueryString = (index: number) => {
      if (index === -1) {
        return "doneAt BETWEEN { $0 , $1 } SORT(doneAt DESC)"
      }
      return "doneAt BETWEEN { $0 , $1 } AND group == $2 SORT(doneAt DESC)"
    }
    const spendsList = useQuery(
      Spend,
      (spends) => {
        const args: Array<Date | string> = [startDate, endDate]
        if (selectedGroup !== -1) {
          args.push(groupsNames[selectedGroup])
        }
        return spends.filtered(getQueryString(selectedGroup), ...args)
      },
      [groupsNames, selectedGroup],
    )

    const spendsChartBaseData = useMemo(() => {
      let pieData = []
      for (const [index, item] of groupsNames.entries()) {
        const res = realm
          .objects(Spend)
          .filtered(getQueryString(0), startDate, endDate, item)
          .sum("total")
        pieData.push({ ...PieCharColors[index], value: (res * 100) / totalSpend })
      }
      return pieData
    }, [groupsNames])

    const spendsChartData = useMemo(() => {
      let pieData = []
      for (const [index, item] of spendsChartBaseData.entries()) {
        pieData.push({ ...item, focused: index === selectedGroup })
      }
      return pieData
    }, [selectedGroup, spendsChartBaseData])

    const renderSpendItem = (item: Spend) => {
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
              <Text variant="labelMedium">تاریخ عملیات</Text>
              <Text variant="labelMedium">{formatDateIR(item.doneAt)}</Text>
            </View>
            <View style={$detail}>
              <Text variant="labelMedium">دریافت کننده</Text>
              <Text>{item.recipient ?? "ثبت نشده"}</Text>
            </View>
            <View style={$detail}>
              <Text variant="labelMedium">مبلغ</Text>
              <Text variant="bodyLarge">{currencyFormatter.format(item.amount)}</Text>
            </View>
          </Surface>
        </TouchableOpacity>
      )
    }

    const renderListItem = ({ item }: ListRenderItemInfo<Spend>) => renderSpendItem(item)
    const headItem = useObject(Spend, new BSON.ObjectID(itemId))
    const renderHeadItem = () => {
      if (headItem) {
        return renderSpendItem(headItem)
      }
      return undefined
    }
    useEffect(()=>{
      if(itemId){
        setTimeout(()=>{
          navigation.setParams({itemId:undefined})
        },3000)
      }
      return ()=>navigation.setParams({itemId:undefined})
    },[])

    return (
      <>
        <Screen style={$root} safeAreaEdges={["top", "bottom"]} preset="fixed">
          <View>
            <Surface>
              <Surface elevation={5}>
                <View style={{ margin: 3, padding: 3 }}>
                  <Text variant="bodyMedium" style={{ textAlign: "center" }}>
                    {currencyFormatter.format(totalFund - totalSpend) + " مانده"}
                  </Text>
                </View>
              </Surface>
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
                    onDateChange={(value) => {
                      setEndDate(value)
                    }}
                    action={({ open, close, value }) => {
                      return (
                        <Button
                          style={{ marginTop: "10%" }}
                          icon={(props) => (
                            <Icon
                              source="calendar-end"
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
                </View>
                <PieChart
                  data={spendsChartData}
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
                          {currencyFormatter.format(spendsList.sum("amount"))}
                        </Text>

                        <Text
                          style={{ fontSize: 14, color: "white" }}
                          text={" مخارج " + (groupsNames[selectedGroup] ?? "کل")}
                        />
                      </View>
                    )
                  }}
                />
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
              >
                <View style={{ margin: 2 }}>
                  <Chip
                    textStyle={{ fontSize: 10 }}
                    maxFontSizeMultiplier={1}
                    showSelectedOverlay
                    selected={-1 === selectedGroup}
                    onPress={() => {
                      setSelectedGroup(-1)
                    }}
                  >
                    همه
                  </Chip>
                </View>
                {groupsNames.map((i, index) => {
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
                            color={spendsChartData[index].color}
                          />
                        )}
                      >
                        {i}
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
              data={spendsList.filter((i) => i._id.toHexString() !== itemId)}
              ListHeaderComponent={renderHeadItem}
              renderItem={renderListItem}
            ></ListView>
          </View>
        </Screen>
        <FAB
          style={{ position: "absolute", bottom: 0, left: 0, margin: 16 }}
          onPress={() => {
            navigation.navigate("TankhahSpendForm", {})
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

const $sectionContainer: ViewStyle = {
  borderColor: colors.border,
  backgroundColor: "#EAEAEA",
  borderStyle: "solid",
  // borderWidth: 5,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  borderTopWidth: 0.5,
  // margin: 5,
  // padding: 5,
}
const $sectionLabel: ViewStyle = { alignSelf: "flex-start" }
