import { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps, AppNavigation } from "app/navigators"
import { Project } from "app/models/realm/calendar"
import { Appbar, Dialog, DialogProps, List, Portal, Searchbar, Switch, Text } from "react-native-paper"
import { useObject, useQuery, useRealm } from "@realm/react"
import { BSON, UpdateMode } from "realm"
import { Button, ListView, ListViewRef, TextField } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import React from "react"
import DraggableFlatList from "react-native-draggable-flatlist"

interface ProjectListScreenProps extends AppStackScreenProps<"ProjectList"> { }

export const ProjectListScreen: FC<ProjectListScreenProps> = observer(function ProjectListScreen(
  _props,
) {
  const { mode = "manage" } = _props.route.params
  // Pull in one of our MST stores
  const {
    calendarStore: { selectProjectId },
  } = useStores()
  const navigation = useNavigation<AppNavigation>()
  const realm = useRealm()

  const refList = useRef<ListViewRef<Project | string>>(null)
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<Project>()
  const [search, setSearch] = useState("")
  const [res, setRes] = useState<Project>()

  const data = useQuery({
    type: Project,
    query: (res) => {
      return res.filtered("name Contains $0 AND deleted != $1", search, true).sorted("order")
    }
  },
    [search],
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

  const renderItem = ({ item, drag, isActive }: { item: Project | string, drag: () => void, isActive: boolean }) => {
    if (item instanceof Project) {
      return (
        <List.Item
          onPress={() => {
            switch (mode) {
              case "manage":
                setSelected(item)
                navigation.navigate("ProjectDetail", { itemId: item._id.toHexString() })
                break
              case "select":
                selectProjectId(item._id.toHexString())
                if (navigation.canGoBack()) {
                  navigation.goBack()
                } else {
                  navigation.navigate("AppTabs", { screen: "CalendarHome" })
                }
                break
            }
          }}
          onLongPress={drag}
          title={item.name}
          description={item.description}
          style={{ opacity: isActive ? 0.5 : 1 }}
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
    return data.slice()
  }, [data])

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
      <DraggableFlatList
        keyExtractor={(i) => (i instanceof Project ? i._objectKey() : i)}
        data={listData}
        renderItem={renderItem}
        onDragEnd={({ data }) => {
          realm.write(() => {
            data.forEach((item, index) => {
              if (item instanceof Project) {
                item.order = index
              }
            })
          })
        }}
      ></DraggableFlatList>
      <ProjectModal
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
      ></ProjectModal>
    </>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

interface ProjectModalProps extends Omit<DialogProps, "children"> {
  itemId?: string
  onDone?: (item?: Project) => void
}

export const ProjectModal: FC<ProjectModalProps> = (_props) => {
  const { itemId, onDone, ...dialogProps } = _props
  const realm = useRealm()
  const data = useObject(Project, new BSON.ObjectID(itemId))

  const [name, setName] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [active, setActive] = useState(true)
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>()

  const validateForm = () => {
    let errors: Record<string, string> = {}
    if (!name) {
      errors.name = "فیلد نام الزامیست"
    }
    setErrors(errors)
    let iv = Object.keys(errors).length === 0 || errors === undefined
    return iv
  }

  const handleSubmit = () => {
    setLoading(true)
    if (validateForm()) {
      const res = realm.write(() => {
        return realm.create(
          Project,
          {
            _id: data ? data._id : new BSON.ObjectID(),
            name,
            description,
            active,
          },
          data ? UpdateMode.Modified : undefined,
        )
      })
      console.log("res:", res)
      onDone && onDone(res)
      clear()
    }
    setLoading(false)
  }

  const clear = () => {
    setErrors(undefined)
    setName(undefined)
    setDescription(undefined)
    setActive(false)
    setTouched(false)
  }

  useEffect(() => {
    if (!loading) {
      if (data) {
        setName(data.name)
        setDescription(data.description)
        console.log("data.actice:", data.active)
        setActive(data.active)
      } else {
        clear()
      }
    }
  }, [data, loading])

  useEffect(() => {
    if (touched) {
      validateForm()
    }
  }, [touched, name])

  return (
    <Portal>
      <Dialog {...dialogProps}>
        <Dialog.Title>نیروی کار</Dialog.Title>
        <Dialog.Content>
          <TextField
            dense
            placeholder="*نام"
            value={name}
            onChangeText={(value) => setName(value)}
            error={!!errors?.name}
            helper={errors?.name}
            onFocus={() => setTouched(true)}
          />
          <TextField
            dense
            placeholder="توضیحات (اختیاری)"
            value={description}
            multiline
            numberOfLines={1}
            onChangeText={(value) => setDescription(value)}
            onFocus={() => setTouched(true)}
          />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="labelMedium">فعال</Text>
            <Switch
              value={active}
              onValueChange={(value) => setActive(value)}
            />
          </View>

        </Dialog.Content>
        <Dialog.Actions>
          <Button
            disabled={!name}
            tx={!itemId ? "common.add" : "common.save"}
            onPress={handleSubmit}
          />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}
