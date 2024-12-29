import { FC, useCallback, useRef, useState, useEffect, useMemo } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppTabScreenProps, AppNavigation } from "app/navigators"
import { Button, DatePicker, ListView, TimeIndicator, Text } from "app/components"
import {
  Appbar,
  Card,
  Divider,
  Drawer,
  FAB,
  Icon,
  IconButton,
  List,
  Surface,
  useTheme,
} from "react-native-paper"
import { formatDateIRDisplay } from "app/utils/formatDate"
import { useNavigation } from "@react-navigation/native"
import PagerView from "react-native-pager-view"
import { TimeRangeIndicator } from "app/components/TimeRangeIndicator"
import { useStores } from "app/models"
import { useQuery, useRealm } from "@realm/react"
import { Attendance, Event, Project, Task } from "app/models/realm/calendar"
import { addDays, addMinutes, endOfDay, format, isPast } from "date-fns-jalali"
import { ListRenderItem } from "@shopify/flash-list"
import startOfDay from "date-fns/startOfDay"
import { spacing } from "app/theme"
import Animated, { FadeInRight, FadeOutRight } from "react-native-reanimated"
import { ProjectModal } from "./ProjectListScreen"
import { BSON } from "realm"
import { BottomSheetForm, BottomSheetFormRef } from "./BottomSheetForm"

interface CalendarScreenProps extends AppTabScreenProps<"CalendarHome"> { }

export const CalendarHomeScreen: FC<CalendarScreenProps> = observer(function CalendarHomeScreen(
  _props,
) {
  // Pull in one of our MST stores
  const {
    calendarStore: { setProp, currentDate, selectProjectId, currentView },
  } = useStores()
  // Pull in navigation via hook
  const navigation = useNavigation<AppNavigation>()
  // Pull in real via hook
  const realm = useRealm()
  const theme = useTheme()
  // refs

  const pagerRef = useRef<PagerView>(null)
  const formRef = useRef<BottomSheetFormRef>(null)

  // states
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedAttendance, setSelectedAttendance] = useState<number>()
  const [selectedEvent, setSelectedEvent] = useState<number>()
  const [selectedTask, setSelectedTask] = useState<number>()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Realm queries
  const projects = useQuery(Project, (col) => {
    return col.filtered("deleted != $0", true)
  })

  const currentAttendance = useQuery(
    Attendance,
    (col) => {
      return col
        .filtered(
          "project._id == $0",
          projects[currentPage] ? projects[currentPage]._id : new BSON.ObjectID(),
        )
        .filtered("from BETWEEN {$0 , $1}", startOfDay(currentDate), endOfDay(currentDate))
    },
    [currentDate, currentPage, projects],
  )

  const currentEvents = useQuery(
    Event,
    (col) => {
      return col
        .filtered(
          "project._id == $0",
          projects[currentPage] ? projects[currentPage]._id : new BSON.ObjectID(),
        )
        .filtered(
          "from BETWEEN {$0 , $1} OR to BETWEEN {$0 , $1}",
          startOfDay(currentDate),
          endOfDay(currentDate),
        )
    },
    [currentDate, currentPage, projects],
  )

  const currentTasks = useQuery(
    Task,
    (col) => {
      return col.filtered("isDone == $0", false)
    }

  )

  const handleFormNew = () => {
    formRef.current?.newForm()
  }
  const handleFormEdit = (item: Attendance | Event | Task) => (e: any) => {
    formRef.current?.editForm(item)
  }
  const handleDeleteItem = (item: Attendance | Event | Task) => (e: any) => {
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
          title={(projects[currentPage] && projects[currentPage].name) || "ندارد"}
        ></Appbar.Content>
        <Appbar.Action
          mode="contained-tonal"
          icon="arrow-right-circle"
          onPress={() => {
            setProp("currentDate", addDays(currentDate, 1))
          }}
        />
        <DatePicker
          date={currentDate}
          onDateChange={(value) => {
            setProp("currentDate", value)
          }}
          action={({ open, close, value }) => {
            return (
              <Button
                mode="contained-tonal"
                labelStyle={theme.fonts.bodySmall}
                text={value ? formatDateIRDisplay(value) : " : "}
                onPress={() => open()}
              />
            )
          }}
        />
        <Appbar.Action
          mode="contained-tonal"
          icon="arrow-left-circle"
          onPress={() => {
            setProp("currentDate", addDays(currentDate, -1))
          }}
        />
      </Appbar.Header>
    )
  }, [currentDate, currentPage, projects, drawerOpen])

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
                >{`${format(item.from, "HH:mm")} ${item.to ? "" : "-"} ${item.to ? format(item.to, "HH:mm") : ""
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
                `${format(item.from, "HH:mm")} ${item.to ? "" : "-"} ${item.to ? format(item.to, "HH:mm") : ""
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

  const renderTaskItem: ListRenderItem<Task> = ({ item, index }) => {
    const itemColor = () => {
      if (item.dueDate && isPast(item.dueDate)) {
        return theme.colors.errorContainer
      }
      return undefined
    }
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
    if (index === selectedTask)
      return (
        <>
          <Card
            onPress={(props) => {
              setSelectedTask(undefined)
            }}
            mode="outlined"
            style={{ margin: 2, backgroundColor: itemColor() }}
          >
            <Card.Title title={item.title} subtitle={item.description} />
            <Card.Content style={{ flex: 1 }}>
              {item.dueDate && renderRow(
                `${format(item.dueDate, "HH:mm")}`,
                "bell",
              )}
              {item.workers.length > 0 &&
                renderRow(item.workers.map((i) => i.name).join(", "), "account")}
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
                <IconButton icon="check-bold" mode="outlined" onPress={handleDeleteItem(item)} />
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
          onPress={() => setSelectedTask(index)}
          style={{ backgroundColor: itemColor() }}
        ></List.Item >
      </>
    )
  }

  const renderItem: ListRenderItem<Task | Event | Attendance | string> = (info) => {
    if (info.item instanceof Event) {
      return renderEventItem(info as any)
    }
    if (info.item instanceof Attendance) return renderAttendanceItem(info as any)
    if (info.item instanceof Task) return renderTaskItem(info as any)
    return <List.Subheader>{info.item}</List.Subheader>
  }

  const renderDrawer = () => (
    <Animated.View entering={FadeInRight} exiting={FadeOutRight} style={{ height: "100%" }}>
      <Surface style={{ paddingTop: spacing.md }}>
        <Drawer.Section>
          <Drawer.CollapsedItem
            active={currentView === "all"}
            focusedIcon="book-clock"
            unfocusedIcon="book-clock-outline"
            label="همه"
            onPress={() => {
              setProp("currentView", "all")
              setDrawerOpen(false)
            }}
          />
          <Drawer.CollapsedItem
            active={currentView === "attendance"}
            focusedIcon="book-clock"
            unfocusedIcon="book-clock-outline"
            label="حضور"
            onPress={() => {
              setProp("currentView", "attendance")
              setDrawerOpen(false)
            }}
          />
          <Drawer.CollapsedItem
            active={currentView === "event"}
            focusedIcon="calendar"
            unfocusedIcon="calendar-outline"
            label="رخداد"
            onPress={() => {
              setProp("currentView", "event")
              setDrawerOpen(false)
            }}
          />
          <Drawer.CollapsedItem
            active={currentView === "task"}
            focusedIcon="bell"
            unfocusedIcon="bell-outline"
            label="کارها"
            onPress={() => {
              setProp("currentView", "task")
              setDrawerOpen(false)
            }}
          />
        </Drawer.Section>
        <Drawer.Section>
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
        </Drawer.Section>
      </Surface>
    </Animated.View>
  )

  const data = useMemo(() => {
    if (currentView === "all") return ["حضور", ...currentAttendance, "رخدادها", ...currentEvents, "کارها", ...currentTasks]
    if (currentView === "attendance") {
      return currentAttendance.slice()
    }
    if (currentView === "event") {
      return currentEvents.slice()
    }
    if (currentView === "task") {
      return currentTasks.slice()
    }
    return []
  }, [currentEvents, currentView, currentAttendance, currentTasks])

  useEffect(() => {
    if (currentPage < projects.length) pagerRef.current?.setPageWithoutAnimation(currentPage)
  }, [projects])

  return (
    <>
      {renderHeader()}
      <TimeIndicator></TimeIndicator>
      <ProjectModal visible={!projects[currentPage]} />
      <PagerView
        ref={pagerRef}
        style={[$root]}
        initialPage={currentPage}
        onPageSelected={(e) => {
          setCurrentPage(e.nativeEvent.position)
          projects[e.nativeEvent.position] &&
            selectProjectId(projects[e.nativeEvent.position]._id.toHexString())
        }}
      >
        {projects.map((i, index) => (
          <View key={i._id.toHexString()} style={[{ flex: 1, flexDirection: "row-reverse" }]}>
            <ListView data={data} scrollEnabled renderItem={renderItem} />
            <View>{drawerOpen && renderDrawer()}</View>
          </View>
        ))}
      </PagerView>

      <BottomSheetForm
        ref={formRef}
        onDone={(value) => {
          if (!(value instanceof Task)) {
            setProp("currentDate", startOfDay(value.from))
            const pageNumber = projects.findIndex((i) => {
              return i._id.toHexString() === value.project._id.toHexString()
            })
            if (pageNumber > 0) pagerRef.current?.setPageWithoutAnimation(pageNumber)
          }
        }}
      ></BottomSheetForm>
      <Button onPress={() => setProp("currentDate", new Date())} style={$toDay}>
        {formatDateIRDisplay(new Date())}
      </Button>

      <FAB style={$fab} onPress={handleFormNew} icon="plus" />
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
