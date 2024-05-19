import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, useWindowDimensions } from "react-native"
import { AppTabScreenProps, StackNavigation } from "app/navigators"
import { Button, DatePicker, ListView, Screen, Text, TimeIndicator } from "app/components"
import { SceneMap, TabView } from "react-native-tab-view"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Appbar, Card, List, Menu, useTheme } from "react-native-paper"
import { formatDateIR } from "app/utils/formatDate"
import { useNavigation } from "@react-navigation/native"
import PagerView from "react-native-pager-view"
import { resources, zones } from "./test-data"
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { TimeRangeIndicator } from "app/components/TimeRangeIndicator"
import { $debugBorder, $row } from "app/theme"
import { format } from "date-fns"
// import { useStores } from "app/models"

interface AttendanceHomeScreenProps extends AppTabScreenProps<"AttendanceHome"> {}

const FirstRoute = () => <View style={{ flex: 1, backgroundColor: "#ff4081" }} />

const SecondRoute = () => (
  <View style={{ flex: 1, backgroundColor: "#673ab7", borderColor: "red", borderWidth: 2 }} />
)

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
})

export const AttendanceHomeScreen: FC<AttendanceHomeScreenProps> = observer(
  function AttendanceHomeScreen() {
    // Pull in one of our MST stores
    // const { someStore, anotherStore } = useStores()

    const { colors } = useTheme()
    // Pull in navigation via hook
    const navigation = useNavigation<StackNavigation>()

    const $safeAreaStyle = useSafeAreaInsetsStyle(["bottom"])

    const [currentDate, setCurrentDate] = useState(new Date())
    // const currentDateRange = useMemo(
    //   () => [currentDate.setHours(0, 0, 0), currentDate.setHours(23, 59, 59)],
    //   [currentDate],
    // )

    const [selectedFilter, setSelectedFilter] = useState<string>("همه")
    const [openFilterMenu, setOpenFilterMenu] = useState(false)

    const handleToggleFilterMenu = () => {
      setOpenFilterMenu((prev) => !prev)
    }
    const selectFilter = (i: string) => () => {
      setSelectedFilter(i)
      setOpenFilterMenu(false)
    }
    const renderFilterMenu = useCallback(() => {
      return (
        <Menu
          visible={openFilterMenu}
          onDismiss={handleToggleFilterMenu}
          anchorPosition="top"
          anchor={
            <Button
              // style={{ marginTop: 10 }}
              mode="contained-tonal"
              onPress={handleToggleFilterMenu}
              icon="filter"
            >
              {selectedFilter}
            </Button>
          }
        >
          {zones.map((i) => (
            <Menu.Item key={i} onPress={selectFilter(i)} title={i} />
          ))}
        </Menu>
      )
    }, [openFilterMenu, selectedFilter])

    const renderHeader = useCallback(() => {
      return (
        <Appbar.Header elevated>
          <DatePicker
            date={currentDate}
            onDateChange={(value) => {
              setCurrentDate(value)
            }}
            action={({ open, close, value }) => {
              return <Button mode="contained-tonal" text={formatDateIR(value)} onPress={open} />
            }}
          />
          {renderFilterMenu()}
        </Appbar.Header>
      )
    }, [currentDate, renderFilterMenu])

    return (
      <>
        {renderHeader()}
        <TimeIndicator></TimeIndicator>
        <PagerView
          style={$root}
          initialPage={0}
        >
          {zones.map((i, index) => (
            <View key={index}>
              <ListView
                data={resources}
                ListHeaderComponent={() => (
                  <List.Subheader style={{ textAlign: "center" }}>{i}</List.Subheader>
                )}
                scrollEnabled
                renderItem={({ item }) => {
                  return (
                    <>
                      <Card>
                        <Card.Title title={item.name} subtitle={item.type} />
                        <Card.Content>
                          <View style={$row}>
                            <DatePicker
                              date={item.start}
                              action={({ open, close, value }) => {
                                return (
                                  <Button
                                    mode="text"
                                    text={format(value, "HH:mm:ss")}
                                    onPress={open}
                                  />
                                )
                              }}
                            />
                            <DatePicker
                              date={item.end}
                              action={({ open, close, value }) => {
                                return (
                                  <Button
                                    mode="text"
                                    text={format(value, "HH:mm:ss")}
                                    onPress={open}
                                  />
                                )
                              }}
                            />
                          </View>
                        </Card.Content>
                        <TimeRangeIndicator range={[item.start, item.end]}></TimeRangeIndicator>
                      </Card>
                    </>
                  )
                }}
              />
            </View>
          ))}
          {/* <View key="1">
            <Text>First page</Text>
          </View>
          <View key="2">
            <Text>Second page</Text>
          </View> */}
        </PagerView>
        {/* <View style={{ height: 20, backgroundColor: "red" }}></View> */}
      </>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
  borderColor: "red",
  borderWidth: 2,
}
