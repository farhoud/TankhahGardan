import React, { FC, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View } from "react-native"
import { AppNavigation, AppStackScreenProps } from "app/navigators"
import { ListView, Screen, Text } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { useObject, useRealm } from "@realm/react"
import { BSON, UpdateMode } from "realm"
import { TankhahGroup, TankhahItem } from "app/models/realm/tankhah"
import { Appbar, IconButton, List, useTheme } from "react-native-paper"
import { ListRenderItem } from "@shopify/flash-list"
import { TankhahGroupFormModal } from "./TankhahGroupFromModal"

interface TankhahGroupDetailScreenProps extends AppStackScreenProps<"TankhahGroupDetail"> {}

export const TankhahGroupDetailScreen: FC<TankhahGroupDetailScreenProps> = observer(
  function TankhahGroupDetailScreen(_props) {
    const itemId = _props.route.params.itemId
    // Pull in one of our MST stores
    const theme = useTheme()
    const realm = useRealm()

    // Pull in navigation via hook
    const navigation = useNavigation<AppNavigation>()


    const item = useObject(TankhahGroup, new BSON.ObjectID(itemId))

    const [visible, setVisible] = useState(false)

    const handleBack = () => {
      navigation.canGoBack() && navigation.goBack()
    }

    const handleDeleteItem = () => {
      if (item) {
        realm.write(() => {
          return realm.create(TankhahGroup, { ...item, deleted: true }, UpdateMode.Modified)
        })
        navigation.goBack()
      }
    }

    if (!item) {
      return <></>
    }

    const renderHeader = () => (
      <>
        <Appbar>
          <Appbar.BackAction onPress={handleBack}></Appbar.BackAction>
        </Appbar>
        <View>
          <Text variant="headlineLarge" text={item?.name} style={{ textAlign: "center" }} />
          <Text variant="headlineMedium" text={item.description} style={{ textAlign: "center" }} />
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <IconButton mode="outlined" icon={"delete"} size={26} onPress={handleDeleteItem} />
            <IconButton
              mode="outlined"
              icon={"account-edit"}
              size={26}
              onPress={() => {
                setVisible(true)
              }}
            />
          </View>
        </View>
      </>
    )

    const renderItem: ListRenderItem<TankhahItem> = ({ item }) => {
   
        return (
          <List.Item
            title={item.description || ""}
            titleStyle={theme.fonts.bodyMedium}
            right={() => <Text>{item.amount}</Text>}
            description={item.paymentMethod}
          />
        )
      

    }

    const listData = useMemo(() => {
      return [...item.tankhahItems]
    }, [item.tankhahItems])

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
        {renderHeader()}
        <List.Subheader>رخدادها</List.Subheader>
        <ListView data={listData} renderItem={renderItem} />
        <TankhahGroupFormModal
          onDone={() => {
            setVisible(false)
          }}
          onDismiss={() => {
            setVisible(false)
          }}
          visible={visible}
          itemId={itemId}
        ></TankhahGroupFormModal>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}
