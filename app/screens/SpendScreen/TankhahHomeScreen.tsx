import React, { FC, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { TouchableOpacity, View, ViewStyle } from "react-native"
import { StackNavigation } from "app/navigators"
import { Button, DateRangePicker, Icon, ListView, Screen, Text } from "app/components"
import { useQuery, useRealm } from "@realm/react"
import { Fund, Spend } from "app/models/realm/models"
import { colors } from "app/theme"
import { subMonths, addDays } from "date-fns"
import { PieChart } from "react-native-gifted-charts"
import { currencyFormatter, formatDateIR } from "app/utils/formatDate"
import { ScrollView } from "react-native-gesture-handler"
import { useNavigation } from "@react-navigation/native"
import { SpendStackScreenProps } from "app/navigators/SpendNavigator"

const PieCharColors = [
  { color: "#009FFF", gradientCenterColor: "#006DFF" },
  { color: "#93FCF8", gradientCenterColor: "#3BE9DE" },
  { color: "#BDB2FA", gradientCenterColor: "#8F80F3" },
  { color: "#FFA5BA", gradientCenterColor: "#FF7F97" },
]

export const TankhahHomeScreen: FC<SpendStackScreenProps<"TankhahHome">> = observer(
  function TankhahHomeScreen() {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()
    const navigation = useNavigation<StackNavigation>()
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
      console.log("pie data: ", pieData)
      return pieData
    }, [selectedGroup, spendsChartBaseData])

    const renderDot = (color: string) => {
      return (
        <View
          style={{
            height: 10,
            width: 10,
            borderRadius: 5,
            backgroundColor: color,
            marginRight: 10,
          }}
        />
      )
    }

    // Pull in navigation via hook
    // const navigation = useNavigation()
    return (
      <>
        <Screen style={$root} preset="fixed">
          <View>
            <View style={$sectionContainer}>
              <Text preset="subheading">{"موجودی"}</Text>
              <Text preset="subheading">{currencyFormatter.format(totalFund - totalSpend)}</Text>
            </View>
          </View>
          <View
            style={{
              // flex:1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View>
              <PieChart
                data={spendsChartData}
                onPress={(s: any, d: any) => {
                  console.log(s, d)
                }}
                donut
                showGradient
                sectionAutoFocus
                radius={120}
                innerRadius={100}
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
              <View style={{ display: "flex" }}>
                <DateRangePicker
                  start={startDate}
                  end={endDate}
                  onEndChange={(value) => {
                    setEndDate(value)
                  }}
                  onStartChange={(value) => {
                    setStartDate(value)
                  }}
                ></DateRangePicker>
              </View>
            </View>
            <ScrollView style={{ flex: 1, marginRight: 10, maxHeight: 300 }}>
              <View
                style={{
                  padding: 0,
                  margin: 0,
                }}
              >
                <Button
                  preset={-1 === selectedGroup ? "filled" : "default"}
                  style={{ width: "100%" }}
                  onPress={() => {
                    setSelectedGroup(-1)
                  }}
                >
                  همه
                </Button>
                {groupsNames.map((i, index) => {
                  return (
                    <Button
                      key={index}
                      preset={index === selectedGroup ? "filled" : "default"}
                      style={{ width: "100%" }}
                      onPress={() => {
                        setSelectedGroup(index)
                      }}
                      LeftAccessory={() => {
                        return renderDot(spendsChartData[index].color)
                      }}
                    >
                      {i}
                    </Button>
                  )
                })}
              </View>
            </ScrollView>
          </View>

          <ListView
            data={spendsList.slice(0, spendsList.length)}
            style={{ marginBottom: 350 }}
            renderItem={(j) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Demo", {
                      screen: "SpendStack",
                      params: {
                        screen: "TankhahSpendItem",
                        params: { itemId: j.item._id.toHexString() },
                      },
                    })
                  }}
                  onLongPress={() => {
                    navigation.navigate("Demo", {
                      screen: "SpendStack",
                      params: {
                        screen: "TankhahSpendForm",
                        params: { itemId: j.item._id.toHexString() },
                      },
                    })
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      elevation: 5,
                      margin: 2,
                      padding: 10,
                      backgroundColor: "#EAEAEA",
                    }}
                  >
                    <View style={$detail}>
                      <Text preset="formLabel">تاریخ عملیات</Text>
                      <Text preset="formLabel">{formatDateIR(j.item.doneAt)}</Text>
                    </View>
                    <View style={$detail}>
                      <Text preset="formLabel">دریافت کننده</Text>
                      <Text>{j.item.recipient ?? "ثبت نشده"}</Text>
                    </View>
                    <View style={$detail}>
                      <Text preset="formLabel">مبلغ</Text>
                      <Text preset="bold">{currencyFormatter.format(j.item.amount)}</Text>
                    </View>
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
              screen: "SpendStack",
              params: {
                screen: "TankhahSpendForm",
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
  marginTop: 50,
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
