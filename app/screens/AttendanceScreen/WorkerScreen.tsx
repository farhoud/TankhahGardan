import { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps, AppNavigation } from "app/navigators"
import { Worker } from "app/models/realm/calendar"
import {
  Appbar,
  Chip,
  Dialog,
  DialogProps,
  Icon,
  IconButton,
  List,
  Menu,
  Portal,
  Searchbar,
  useTheme,
} from "react-native-paper"
import { useObject, useQuery, useRealm } from "@realm/react"
import { BSON, UpdateMode } from "realm"
import { Button, ListView, ListViewRef, TextField } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { endOfDay } from "date-fns"
import { startOfDay } from "date-fns-jalali"
import { $row, spacing } from "app/theme"

interface WorkerScreenProps extends AppStackScreenProps<"Worker"> {}

export const WorkerScreen: FC<WorkerScreenProps> = observer(function WorkerScreen(_props) {
  const { mode = "manage" } = _props.route.params
  // Pull in one of our MST stores
  const {
    calendarStore: { deSelectWorker, selectWorker, selectedWorkerObjIds, currentForm, currentDate },
  } = useStores()
  const navigation = useNavigation<AppNavigation>()

  const refList = useRef<ListViewRef<Worker | string>>(null)
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<Worker>()
  const [search, setSearch] = useState("")
  const [res, setRes] = useState<Worker>()

  const [selectedFilter, setSelectedFilter] = useState<string>("")
  const [openFilterMenu, setOpenFilterMenu] = useState(false)

  const handleToggleFilterMenu = () => {
    setOpenFilterMenu((prev) => !prev)
  }
  const selectFilter = (i: string) => () => {
    setSelectedFilter(i)
    setOpenFilterMenu(false)
  }

  const data = useQuery(
    Worker,
    (res) => {
      return res.filtered(
        selectedFilter
          ? "name Contains $0 AND proficiency CONTAINS $2 AND deleted != $1 SORT(name ASC)"
          : "name Contains $0 AND deleted != $1 SORT(name ASC)",
        search,
        true,
        selectedFilter,
      )
    },
    [search,selectedFilter],
  )

  const filterOpts = useQuery(Worker, (res) =>
    res.filtered("proficiency != $0  DISTINCT(proficiency)", null),
  ).slice()

  // renders
  const renderFilterMenu = useCallback(() => {
    return (
      <Menu
        visible={openFilterMenu}
        onDismiss={handleToggleFilterMenu}
        anchorPosition="top"
        anchor={
          <IconButton
            // style={{ marginTop: 10 }}
            mode="contained-tonal"
            onPress={handleToggleFilterMenu}
            icon="filter"
          ></IconButton>
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

  const selectedWorkers = useQuery(
    Worker,
    (res) => {
      return res.filtered("_id IN $0", selectedWorkerObjIds)
    },
    [selectedWorkerObjIds],
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              navigation.canGoBack() && navigation.goBack()
            }}
          />
          <Appbar.Action
            icon="plus"
            onPress={() => {
              setSelected(undefined)
              setVisible(true)
            }}
          />
        </Appbar.Header>
      ),
    })
  })

  const renderItem = ({ item }: { item: Worker | string }) => {
    if (item instanceof Worker) {
      return (
        <List.Item
          onPress={() => {
            switch (mode) {
              case "manage":
                setSelected(item)
                // setVisible(true)
                navigation.navigate("WorkerDetail", { itemId: item._id.toHexString() })
                break
              case "select":
                selectWorker(item._id.toHexString())
                currentForm === "attendance" &&
                  navigation.navigate("AppTabs", { screen: "CalendarHome" })
                break
            }
          }}
          title={item.name}
          description={`${item.proficiency || ""} ${item.skill || ""}`}
        />
      )
    }
    return (
      <>
        <List.Subheader>{item}</List.Subheader>
      </>
    )
  }

  const listData = useMemo(() => {
    if (currentForm === "event") {
      const isAttended = data.filtered(
        "NOT _id IN $0 AND ANY attendance.from BETWEEN {$1,$2}",
        selectedWorkerObjIds,
        startOfDay(currentDate),
        endOfDay(currentDate),
      )
      const rest = data.filtered(
        "NOT _id IN $0 AND NONE attendance.from BETWEEN {$1,$2}",
        selectedWorkerObjIds,
        startOfDay(currentDate),
        endOfDay(currentDate),
      )
      return ["حاضرین", ...isAttended, "بقیه", ...rest]
    }
    return data.slice()
  }, [currentDate, selectedWorkerObjIds,data])

  useEffect(() => {
    if (res) {
      const index = data.findIndex((i) => i._objectKey() === res._objectKey())
      if (index > -1) refList.current?.scrollToIndex({ animated: true, index: index })
      setRes(undefined)
    }
  }, [res])
  

  return (
    <>
      <Searchbar
        value={search}
        onChangeText={(value) => {
          setSearch(value)
        }}
        clearButtonMode="while-editing"
        right={renderFilterMenu}
      ></Searchbar>
      {/* <List.Section> */}
      <ListView
        ref={refList}
        keyExtractor={(i) => (i instanceof Worker ? i._objectKey() : i)}
        ListHeaderComponent={() => {
          if (currentForm === "attendance") {
            return undefined
          }
          return (
            <>
              <List.Subheader>منتخبین</List.Subheader>
              <View style={[$row, { justifyContent: "flex-start", flexWrap: "wrap" }]}>
                {selectedWorkers.map((i) => (
                  <Chip
                    style={{ marginStart: spacing.xxs }}
                    icon="close"
                    onPress={() => {
                      deSelectWorker(i._id.toHexString())
                    }}
                    key={i._objectKey()}
                  >
                    {i.name}
                  </Chip>
                ))}
              </View>
            </>
          )
        }}
        data={listData}
        renderItem={renderItem}
        style={$root}
      ></ListView>
      {/* </List.Section> */}
      <WorkerModal
        onDone={(item) => {
          setRes(item)
          setSelected(undefined)
          setVisible(false)
        }}
        onDismiss={() => {
          setVisible(false)
          setSelected(undefined)
        }}
        visible={visible}
        itemId={selected?._id.toHexString()}
      ></WorkerModal>
    </>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

interface WorkerModalProps extends Omit<DialogProps, "children"> {
  itemId?: string
  onDone?: (item?: Worker) => void
}

export const WorkerModal: FC<WorkerModalProps> = (_props) => {
  const { itemId, onDone, ...dialogProps } = _props
  const realm = useRealm()
  const data = useObject(Worker, new BSON.ObjectID(itemId))
  const theme = useTheme()

  const [name, setName] = useState<string>()
  const [skill, setSkill] = useState<string>()
  const [proficiency, setProficiency] = useState<string>()
  const [touched, setTouched] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>()

  const validateForm = () => {
    let errors: Record<string, string> = {}
    if (!name) {
      errors.name = "فیلد تاریخ الزامیست"
    }
    setErrors(errors)
    setIsValid(Object.keys(errors).length === 0)
  }

  const handleSubmit = () => {
    validateForm()
    if (isValid) {
      const res = realm.write(() => {
        return realm.create(
          Worker,
          {
            _id: data ? data._id : new BSON.ObjectID(),
            name,
            skill,
            proficiency,
          },
          data ? UpdateMode.Modified : undefined,
        )
      })
      onDone && onDone(res)
      clear()
    }
  }

  const clear = () => {
    setErrors(undefined)
    setName(undefined)
    setSkill(undefined)
    setProficiency(undefined)
    setTouched(false)
    setIsValid(false)
  }

  useEffect(() => {
    if (data) {
      setName(data.name)
      setSkill(data.skill)
      setProficiency(data.proficiency)
    } else {
      clear()
    }
  }, [data])

  useEffect(() => {
    if (touched) {
      validateForm()
    }
  }, [touched, name, proficiency, skill])

  return (
    <Portal>
      <Dialog {...dialogProps}>
        <Dialog.Title>نیروی کار</Dialog.Title>
        <Dialog.Content>
          <TextField
            label="*نام"
            value={name}
            onChangeText={(value) => setName(value)}
            error={!!errors?.name}
            helper={errors?.name}
            onFocus={() => setTouched(true)}
          />
          <TextField
            label="مهارت"
            value={skill}
            onChangeText={(value) => setSkill(value)}
            onFocus={() => setTouched(true)}
          />
          <TextField
            label="سطح"
            value={proficiency}
            onChangeText={(value) => setProficiency(value)}
            onFocus={() => setTouched(true)}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button tx={!itemId ? "common.add" : "common.save"} onPress={handleSubmit} />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}
