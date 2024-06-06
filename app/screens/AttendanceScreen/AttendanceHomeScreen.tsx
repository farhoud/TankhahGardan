import { FC, useCallback, useRef, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppTabScreenProps, AppNavigation } from "app/navigators"
import { Button, DatePicker, ListView, TimeIndicator, Text } from "app/components"
import { SceneMap } from "react-native-tab-view"
import { Appbar, Card, Divider, FAB, Icon, IconButton, List, Menu } from "react-native-paper"
import { formatDateIR } from "app/utils/formatDate"
import { useNavigation } from "@react-navigation/native"
import PagerView from "react-native-pager-view"
import { TimeRangeIndicator } from "app/components/TimeRangeIndicator"
import { AttendanceForm } from "./AttendanceForm"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { useStores } from "app/models"
import { useQuery, useRealm } from "@realm/react"
import { Attendance, Worker } from "app/models/realm/attendance"
import { addMinutes, endOfDay, format } from "date-fns-jalali"
import { ListRenderItem } from "@shopify/flash-list"
import { $debugBorder } from "app/theme"
import startOfDay from "date-fns/startOfDay"

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
  function AttendanceHomeScreen(_props) {
    // Pull in one of our MST stores
    const {
      attendanceFormStore: { clear, load, setProp, workerId, selecting },
    } = useStores()
    // Pull in navigation via hook
    const navigation = useNavigation<AppNavigation>()
    // Pull in real via hook
    const realm = useRealm()
    // refs
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const pagerRef = useRef<PagerView>(null)

    // states
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedFilter, setSelectedFilter] = useState<string>("")
    const [openFilterMenu, setOpenFilterMenu] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [selectedAttendance, setSelectedAttendance] = useState<number>()

    const filterOpts = useQuery(Worker, (res) =>
      res.filtered("proficiency != $0  DISTINCT(proficiency)", null),
    ).slice()

    // Realm queries
    const groups = useQuery(Attendance, (res) => {
      return res.filtered(
        "group != '' AND from BETWEEN {$0 , $1} DISTINCT(group)",
        startOfDay(currentDate),
        endOfDay(currentDate),
      )
    },[currentDate])

    const attendanceList = useQuery(
      Attendance,
      (res) => {
        let query = "group == $0 AND from BETWEEN {$1 , $2} "
        if(selectedFilter!==""){
          query = "group == $0 AND from BETWEEN {$1 , $2} AND worker.proficiency CONTAINS $3"
        }
        return res.filtered(
          query,
          groups.map((i) => i.group)[currentPage],
          startOfDay(currentDate),
          endOfDay(currentDate),
          selectedFilter,
        )
      },
      [groups, currentPage, currentDate, selectedFilter],
    )

    // handlers
    const handleToggleFilterMenu = () => {
      setOpenFilterMenu((prev) => !prev)
    }
    const selectFilter = (i: string) => () => {
      setSelectedFilter(i)
      setOpenFilterMenu(false)
    }
    const handleFormNew = () => {
      clear(currentDate)
      setProp("group", groups.map((i) => i.group)[currentPage])
      bottomSheetRef.current?.present()
    }
    const handleFormEdit = (item: Attendance) => (e: any) => {
      load(item)
      bottomSheetRef.current?.present()
    }
    const handleDeleteItem = (item: Attendance) => (e: any) => {
      realm.write(() => realm.delete(item))
    }

    // Helpers
    const attendanceSubtitle = (item: Attendance) =>
      (item.worker?.proficiency || "") + " " + (item.worker?.skill || "")

    // renders
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
              {selectedFilter === "" ? "همه" : selectedFilter}
            </Button>
          }
        >
          <Menu.Item key={"all"} onPress={selectFilter("")} title="همه" />
          {filterOpts.map((i, index) => (
            <Menu.Item
              key={index}
              onPress={selectFilter(i.proficiency || "")}
              title={i.proficiency}
            />
          ))}
        </Menu>
      )
    }, [openFilterMenu, selectedFilter, filterOpts])

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
          <Appbar.Action
            icon="account-group"
            onPress={() => {
              navigation.navigate("Worker", {})
            }}
          />
        </Appbar.Header>
      )
    }, [currentDate, renderFilterMenu])

    const renderAttendanceItem: ListRenderItem<Attendance> = ({ item, index }) => {
      if (index === selectedAttendance)
        return (
          <>
            <Card
              onPress={(props) => {
                setSelectedAttendance(undefined)
              }}
              mode="outlined"
              style={{ margin: 2 }}
            >
              <Card.Title
                title={item.worker?.name || "حذف شده"}
                subtitle={attendanceSubtitle(item)}
              />
              <Card.Content style={{ flex: 1 }}>
                <View
                  style={[
                    {
                      alignSelf: "flex-start",
                      paddingHorizontal: 20,
                      flexDirection: "row-reverse",
                    },
                  ]}
                >
                  <Text
                    style={[{ paddingHorizontal: 20, paddingTop: 7 }]}
                    variant="bodyMedium"
                  >{`${format(item.from, "HH:mm")} ${item.to ? "" : "-"} ${
                    item.to ? format(item.to, "HH:mm") : ""
                  }`}</Text>
                  <Icon source="book-clock-outline" size={24} />
                </View>
                <View
                  style={[
                    {
                      alignSelf: "flex-start",
                      paddingHorizontal: 20,
                      flexDirection: "row-reverse",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text style={[{ paddingHorizontal: 20, paddingTop: 7 }]} variant="bodyMedium">
                    {item.group}
                  </Text>
                  <Icon source="book-marker-outline" size={24} />
                </View>
                {!!item.description && (
                  <View
                    style={[
                      {
                        alignSelf: "flex-start",
                        paddingHorizontal: 20,
                        flexDirection: "row-reverse",
                      },
                    ]}
                  >
                    <Text style={[{ paddingHorizontal: 20, paddingTop: 5 }]} variant="bodyMedium">
                      {item.description}
                    </Text>
                    <Icon source="note-text-outline" size={24} />
                  </View>
                )}
              </Card.Content>
              <Divider />
              <Card.Actions style={{ flexDirection: "row", justifyContent: "space-around" }}>
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-around" }}>
                  <IconButton
                    icon="clipboard-edit-outline"
                    mode="outlined"
                    onPress={handleFormEdit(item)}
                  />
                  <IconButton icon="delete" mode="outlined" onPress={handleDeleteItem(item)} />
                </View>
              </Card.Actions>
            </Card>
          </>
        )
      return (
        <>
          <List.Item
            title={item.worker?.name || "حدف شده"}
            description={attendanceSubtitle(item)}
            onPress={() => setSelectedAttendance(index)}
          ></List.Item>
          <TimeRangeIndicator
            range={[item.from, item.to || addMinutes(item.from, 1)]}
          ></TimeRangeIndicator>
        </>
      )
    }

    useEffect(() => {
      const unsubscribe1 = navigation.addListener("focus", (e) => {
        setProp("selecting", false)
        if (workerId) {
          bottomSheetRef.current?.present()
        }
      })

      const unsubscribe2 = navigation.addListener("blur", (e) => {
        bottomSheetRef.current?.close()
      })

      return () => {
        unsubscribe1()
        unsubscribe2()
      }
    }, [navigation, workerId, selecting, setProp])

    useEffect(() => {
      if (currentPage < groups.length) pagerRef.current?.setPageWithoutAnimation(currentPage)
    }, [groups])

    return (
      <>
        {renderHeader()}
        <TimeIndicator></TimeIndicator>
        <PagerView
          ref={pagerRef}
          style={$root}
          initialPage={currentPage}
          onPageSelected={(e) => {
            setCurrentPage(e.nativeEvent.position)
          }}
        >
          {groups.map((i, index) => (
            <View key={index}>
              <ListView
                data={attendanceList.slice()}
                ListHeaderComponent={() => (
                  <List.Subheader style={{ textAlign: "center" }}>{i.group}</List.Subheader>
                )}
                scrollEnabled
                renderItem={renderAttendanceItem}
              />
            </View>
          ))}
        </PagerView>
        <AttendanceForm
          onDismiss={() => !selecting && clear()}
          ref={bottomSheetRef}
        ></AttendanceForm>
        <FAB style={$fab} onPress={handleFormNew} icon="plus" />
      </>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
  borderColor: "red",
  borderWidth: 2,
}

const $fab: ViewStyle = {
  position: "absolute",
  bottom: 16,
  right: 10,
}
