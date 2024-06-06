import { FC, useEffect, useLayoutEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps, AppNavigation } from "app/navigators"
import { Worker } from "app/models/realm/attendance"
import { Appbar, Dialog, DialogProps, List, Portal, Searchbar, useTheme } from "react-native-paper"
import { useObject, useQuery, useRealm } from "@realm/react"
import { BSON, UpdateMode } from "realm"
import { Button, ListView, ListViewRef, TextField } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"

interface WorkerScreenProps extends AppStackScreenProps<"Worker"> {}

export const WorkerScreen: FC<WorkerScreenProps> = observer(function WorkerScreen(_props) {
  const { mode = "manage" } = _props.route.params
  // Pull in one of our MST stores
  const {
    attendanceFormStore: { setProp },
  } = useStores()
  const navigation = useNavigation<AppNavigation>()

  const refList = useRef<ListViewRef<Worker>>(null)
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<Worker>()
  const [search, setSearch] = useState("")
  const [res, setRes] = useState<Worker>()

  const data = useQuery(
    Worker,
    (res) => {
      return res.filtered("name Contains $0 AND deleted != $1 SORT(name ASC)", search,true)
    },
    [search],
  ).slice()

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

  const renderItem = ({ item }: { item: Worker }) => {
    return (
      <>
        <List.Item
          onPress={() => {
            switch (mode) {
              case "manage":
                setSelected(item)
                // setVisible(true)
                navigation.navigate("WorkerDetail",{itemId:item._id.toHexString()})
                break
              case "select":
                setProp("workerId", item._id.toHexString())
                navigation.navigate("AppTabs", { screen: "AttendanceHome" })
                break
            }
          }}
          title={item.name}
          description={`${item.proficiency || ""} ${item.skill || ""}`}
        />
      </>
    )
  }

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
      ></Searchbar>
      <ListView
        ref={refList}
        keyExtractor={(i) => i._objectKey()}
        data={data}
        renderItem={renderItem}
        style={$root}
      ></ListView>
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
