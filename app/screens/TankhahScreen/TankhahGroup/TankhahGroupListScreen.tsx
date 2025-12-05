import React, { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps, AppNavigation } from "app/navigators"
import { Appbar, List, Searchbar } from "react-native-paper"
import { useQuery , useRealm } from "@realm/react"
import { ListView, ListViewRef } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { TankhahGroupFormModal } from "./TankhahGroupFromModal"
import { TankhahGroup } from "app/models/realm/tankhah"
import DraggableFlatList from "react-native-draggable-flatlist"

interface TankhahGroupListScreenProps extends AppStackScreenProps<"TankhahGroupList"> { }

export const TankhahGroupListScreen: FC<TankhahGroupListScreenProps> = observer(function TankhahGroupListListScreen(
  _props,
) {
  const { mode = "manage" } = _props.route.params
  // Pull in one of our MST stores
  const {
    tankhahHomeStore: { setProp },
  } = useStores()
  const navigation = useNavigation<AppNavigation>()
  const realm = useRealm()

  const refList = useRef<ListViewRef<TankhahGroup | string>>(null)
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<TankhahGroup>()
  const [search, setSearch] = useState("")
  const [res, setRes] = useState<TankhahGroup>()

  const data = useQuery({
    type: TankhahGroup,
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

  const renderItem = ({ item, drag, isActive }: { item: TankhahGroup | string, drag: () => void, isActive: boolean }) => {
    if (item instanceof TankhahGroup) {
      return (
        <List.Item
          onPress={() => {
            switch (mode) {
              case "manage":
                setSelected(item)
                navigation.navigate("TankhahGroupDetail", { itemId: item._id.toHexString() })
                break
              case "select":
                setProp("selectedTankhahGroupId", item._id.toHexString())
                if (navigation.canGoBack()) {
                  navigation.goBack()
                } else {
                  navigation.navigate("AppTabs", { screen: "TankhahHome", params: {} })
                }
                break
            }
          }}
          onLongPress={drag}
          style={{ opacity: isActive ? 0.5 : 1 }}
          title={item.name}
          description={item.description}
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
      if (index > -1) refList.current?.scrollToIndex({ animated: true, index })
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
        keyExtractor={(i) => (i instanceof TankhahGroup ? i._objectKey() : i)}
        data={listData}
        renderItem={renderItem}
        onDragEnd={({ data, from, to }) => {
          realm.write(() => {
            data.forEach((item, index) => {
              if (item instanceof TankhahGroup) {
                item.order = index
              }
            })
          })
        }}
      ></DraggableFlatList>
      <TankhahGroupFormModal
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
      ></TankhahGroupFormModal>
    </>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

