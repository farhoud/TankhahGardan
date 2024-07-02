import { FC, useCallback, useRef, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { TouchableWithoutFeedback, View, ViewStyle } from "react-native"
import { AppTabScreenProps, AppNavigation } from "app/navigators"
import { Button, DatePicker, ListView, TimeIndicator, Text, BottomSheet } from "app/components"
import {
  Appbar,
  Card,
  Divider,
  Drawer,
  FAB,
  Icon,
  IconButton,
  List,
  Menu,
  Modal,
  Portal,
  useTheme,
} from "react-native-paper"
import { formatDateIR, formatDateIRDisplay } from "app/utils/formatDate"
import { useNavigation } from "@react-navigation/native"
import PagerView from "react-native-pager-view"
import { TimeRangeIndicator } from "app/components/TimeRangeIndicator"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { useStores } from "app/models"
import { useQuery, useRealm } from "@realm/react"
import { Attendance, Event, Project, Worker } from "app/models/realm/calendar"
import { addMinutes, endOfDay, format } from "date-fns-jalali"
import { ListRenderItem } from "@shopify/flash-list"
import startOfDay from "date-fns/startOfDay"
import { CalendarForm } from "./CalendarForm"
import { BSON } from "realm"
import { $debugBorder, spacing } from "app/theme"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, { FadeInRight, FadeOutRight, useSharedValue } from "react-native-reanimated"

interface CalendarScreenProps extends AppTabScreenProps<"CalendarHome"> {}

export const CalendarHomeScreen: FC<CalendarScreenProps> = observer(function AttendanceHomeScreen(
  _props,
) {
  // Pull in one of our MST stores
  const {
    calendarStore: {
      setProp,
      setGroup,
      load,
      clear,
      currentDate,
      selecting,
      currentProjectId,
      selectProjectId,
      currentForm,
    },
  } = useStores()
  // Pull in navigation via hook
  const navigation = useNavigation<AppNavigation>()
  // Pull in real via hook
  const realm = useRealm()
  const theme = useTheme()
  // refs
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const pagerRef = useRef<PagerView>(null)

  // states
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedAttendance, setSelectedAttendance] = useState<number>()
  const [selectedEvent, setSelectedEvent] = useState<number>()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Realm queries
  const projects = useQuery(Project)

  const handleFormNew = () => {
    clear()
    bottomSheetRef.current?.present()
  }
  const handleFormEdit = (item: Attendance | Event) => (e: any) => {
    load(item)
    bottomSheetRef.current?.present()
  }
  const handleDeleteItem = (item: Attendance | Event) => (e: any) => {
    realm.write(() => realm.delete(item))
  }

  // Helpers
  const attendanceSubtitle = (item: Attendance) =>
    (item.worker?.proficiency || "") + " " + (item.worker?.skill || "")

  const renderHeader = useCallback(() => {
    return (
      <Appbar.Header elevated>
        <Appbar.Action
          icon="menu"
          onPress={() => {
            setDrawerOpen(!drawerOpen)
          }}
        />
        <Appbar.Content
          title={projects[currentPage].name}
        ></Appbar.Content>
        <DatePicker
          date={currentDate}
          onDateChange={(value) => {
            setProp("currentDate", value)
          }}
          action={({ open, close, value }) => {
            return (
              <Button
                mode="contained-tonal"
                text={value ? formatDateIRDisplay(value) : " : "}
                onPress={() => open()}
              />
            )
          }}
        />
      </Appbar.Header>
    )
  }, [currentDate,currentPage,projects])

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
              {!!item.description && (
                <View
                  style={[
                    {
                      marginBottom: spacing.xs,
                      alignSelf: "flex-start",
                      paddingHorizontal: 20,
                      flexDirection: "row-reverse",
                    },
                  ]}
                >
                  <Text style={[{ paddingHorizontal: 20, paddingTop: 5 }]} variant="bodyMedium">
                    {item.description}
                  </Text>
                  <Icon source="text-long" size={24} />
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
          title={item.worker?.name || "حذف شده"}
          description={attendanceSubtitle(item)}
          onPress={() => setSelectedAttendance(index)}
        ></List.Item>
        <TimeRangeIndicator
          range={[item.from, item.to || addMinutes(item.from, 1)]}
        ></TimeRangeIndicator>
      </>
    )
  }

  const renderEventItem: ListRenderItem<Event> = ({ item, index }) => {
    const renderRow = (text: string, icon: string) => {
      return (
        <View
          style={[
            {
              alignSelf: "flex-start",
              // paddingHorizontal: 20,
              flexDirection: "row-reverse",
            },
          ]}
        >
          <Text style={[{ paddingHorizontal: 20, paddingTop: 7 }]} variant="bodyMedium">
            {text}
          </Text>
          <Icon source={icon} size={24} />
        </View>
      )
    }
    if (index === selectedEvent)
      return (
        <>
          <Card
            onPress={(props) => {
              setSelectedEvent(undefined)
            }}
            mode="outlined"
            style={{ margin: 2 }}
          >
            <Card.Title title={item.title} subtitle={item.description} />
            <Card.Content style={{ flex: 1 }}>
              {renderRow(
                `${format(item.from, "HH:mm")} ${item.to ? "" : "-"} ${
                  item.to ? format(item.to, "HH:mm") : ""
                }`,
                "book-clock-outline",
              )}
              {item.workers.length > 0 &&
                renderRow(item.workers.map((i) => i.name).join(", "), "account")}
              {!!item.process &&
                renderRow(`${item.process} ${item.quantity} ${item.unit}`, "progress-wrench")}
            </Card.Content>
            <View style={{ marginBottom: spacing.xs }} />
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
          title={item.title}
          description={item.description}
          onPress={() => setSelectedEvent(index)}
        ></List.Item>
        <TimeRangeIndicator
          range={[item.from, item.to || addMinutes(item.from, 1)]}
        ></TimeRangeIndicator>
      </>
    )
  }

  const renderDrawer = () => (
    <TouchableWithoutFeedback
      onPress={() => {
        setDrawerOpen(false)
      }}
    >
      <Animated.View
        entering={FadeInRight}
        exiting={FadeOutRight}
        style={[
          {
            zIndex: 1000,
            position: "absolute",
            top: 80,
            height: "100%",
            width: "100%",
            // backgroundColor: theme.colors.surfaceVariant,
            // marginTop: 20,
          },
        ]}
      >
        <View
          style={[
            {
              height: "100%",
              width: "20%",
              backgroundColor: theme.colors.surfaceVariant,
              // marginTop: 20,
              paddingTop: spacing.sm,
            },
          ]}
        >
          <Drawer.CollapsedItem
            active={currentForm === "attendance"}
            focusedIcon="book-clock"
            unfocusedIcon="book-clock-outline"
            label="حضور"
            onPress={() => {
              setProp("currentForm", "attendance")
            }}
          />
          <Drawer.CollapsedItem
            active={currentForm === "event"}
            focusedIcon="calendar"
            unfocusedIcon="calendar-outline"
            label="رخداد"
            onPress={() => {
              setProp("currentForm", "event")
            }}
          />
          <View
            style={{
              borderTopWidth: 1,
              marginBottom: spacing.sm,
              borderColor: theme.colors.onSurfaceVariant,
            }}
          />
          <Drawer.CollapsedItem
            // active={currentForm === "event"}
            focusedIcon="account-group"
            // unfocusedIcon="account-group-outline"
            label="نیروها"
            onPress={() => {
              navigation.navigate("Worker", {})
            }}
          />
          <Drawer.CollapsedItem
            // active={currentForm === "event"}
            focusedIcon="domain"
            // unfocusedIcon="account-group-outline"
            label="پروژه ها"
            onPress={() => {
              navigation.navigate("ProjectList", {})
            }}
          />
          {/* </Drawer.Section> */}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  )

  useEffect(() => {
    const unsubscribe1 = navigation.addListener("focus", (e) => {
      if (selecting) {
        bottomSheetRef.current?.present()
      }
      setProp("selecting", false)
    })

    const unsubscribe2 = navigation.addListener("blur", (e) => {
      bottomSheetRef.current?.close()
    })

    return () => {
      unsubscribe1()
      unsubscribe2()
    }
  }, [navigation, selecting, setProp])

  useEffect(() => {
    if (currentPage < projects.length) pagerRef.current?.setPageWithoutAnimation(currentPage)
  }, [projects])

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
          selectProjectId(projects[e.nativeEvent.position]._id.toHexString())
        }}
      >
        {projects.map((i, index) => (
          <View key={index}>
            {currentForm === "attendance" ? (
              <ListView
                data={i.attendances
                  .filtered(
                    "from BETWEEN {$0 , $1}",
                    startOfDay(currentDate),
                    endOfDay(currentDate),
                  )
                  .slice()}
                // ListHeaderComponent={() => (
                //   <List.Subheader style={{ textAlign: "center" }}>{i.group}</List.Subheader>
                // )}
                scrollEnabled
                renderItem={renderAttendanceItem}
              />
            ) : (
              <ListView
                data={i.events
                  .filtered(
                    "from BETWEEN {$0 , $1} OR to BETWEEN {$0 , $1}",
                    startOfDay(currentDate),
                    endOfDay(currentDate),
                  )
                  .slice()}
                // ListHeaderComponent={() => (
                //   <List.Subheader style={{ textAlign: "center" }}>{i.group}</List.Subheader>
                // )}
                scrollEnabled
                renderItem={renderEventItem}
              />
            )}
          </View>
        ))}
      </PagerView>
      <BottomSheet onDismiss={() => !selecting && clear()} ref={bottomSheetRef}>
        <CalendarForm
          onDone={() => {
            bottomSheetRef.current?.close()
            clear()
          }}
        ></CalendarForm>
      </BottomSheet>

      <FAB style={$fab} onPress={handleFormNew} icon="plus" />
      {drawerOpen && renderDrawer()}

      <Button onPress={()=>setProp("currentDate",new Date())} style={$toDay}>{formatDateIRDisplay(new Date())}</Button>
    </>
  )
})

const $root: ViewStyle = {
  flex: 1,
  borderColor: "red",
  borderWidth: 2,
}

const $fab: ViewStyle = {
  position: "absolute",
  bottom: 16,
  right: 10,
  opacity: 0.7,
}

const $toDay: ViewStyle = {
  position: "absolute",
  bottom: 80,
  right: 10,
  opacity: 0.7,
}
