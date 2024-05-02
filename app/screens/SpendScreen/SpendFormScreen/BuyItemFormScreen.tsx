import React, { FC, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, Animated, useWindowDimensions } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, TextField, Text, Button, CurrencyField, ListView } from "app/components"
import {
  Searchbar,
  Badge,
  List,
  Icon,
  IconButton,
  Modal,
  Card,
  Switch,
  Portal,
  Surface,
  useTheme,
  Divider,
} from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { useObject, useQuery, useRealm } from "@realm/react"
import { BSON, UpdateMode } from "realm"
import { ReceiptItem } from "app/models/realm/models"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { RectButton, Swipeable } from "react-native-gesture-handler"
import { useSharedValue } from "react-native-reanimated"
import { SelectedReceiptList } from "./SelectedReceiptList"

interface BuyItemFormScreenProps extends AppStackScreenProps<"BuyItemForm"> {}

export const BuyItemFormScreen: FC<BuyItemFormScreenProps> = observer(function BuyItemFormScreen() {
  // Pull in one of our MST stores
  const {
    spendFormStore: { receiptItemsArray: selectedItems, addReceiptItem, removeReceiptItem },
  } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()
  const theme = useTheme()
  const realm = useRealm()
  // Modal actions
  const [modalVisibility, setModalVisibility] = useState(false)
  const openModal = () => {
    setModalVisibility(true)
  }
  const closeModal = () => {
    setModalVisibility(false)
  }
  //
  // Modal form states
  const [openedItemID, setItemID] = useState()
  const openedItem = useObject(ReceiptItem, new BSON.ObjectID(openedItemID))
  const [title, setTitle] = useState(openedItem?.title || "")
  const [description, setDescription] = useState(openedItem?.description || "")
  const [defaultPrice, setDefaultPrice] = useState(openedItem?.defaultPrice || 0)
  const [searchable, setSearchable] = useState(openedItem?.searchable || false)
  const [error, setError] = useState(false)

  const clearModalForm = () => {
    setTitle(openedItem?.title || "")
    setDescription(openedItem?.description || "")
    setDefaultPrice(openedItem?.defaultPrice || 0)
    setSearchable(openedItem?.searchable || false)
  }

  const handleSubmit = () => {
    const isValid = !!title
    if (isValid) {
      realm.write(() => {
        const res = realm.create(
          "ReceiptItem",
          {
            _id: openedItem ? openedItem._id : new BSON.ObjectID(),
            title,
            description,
            defaultPrice,
            searchable,
          },
          openedItem ? UpdateMode.Modified : undefined,
        )
      })
      closeModal()
      clearModalForm()
      return
    }
    setError(true)
  }

  const renderModal = () => {
    return (
      <Portal>
        <Modal visible={modalVisibility} onDismiss={closeModal}>
          <Card elevation={4}>
            <Card.Content>
              <TextField
                value={title}
                onChangeText={(value) => setTitle(value)}
                error={error}
                labelTx="receiptItemForm.titleLabel"
                placeholderTx="receiptItemForm.titlePlaceholder"
                helperTx={error && title !== undefined ? "receiptItemForm.titleHelper" : undefined}
              />
              <CurrencyField
                value={defaultPrice}
                onChangeValue={(value) => setDefaultPrice(value)}
                error={error}
                labelTx="receiptItemForm.defaultPriceLabel"
                placeholderTx="receiptItemForm.defaultPricePlaceholder"
              />
              <TextField
                value={description}
                onChangeText={(value) => setDescription(value)}
                labelTx="receiptItemForm.descriptionLabel"
                placeholderTx="receiptItemForm.descriptionPlaceholder"
              />
              <View style={$switch}>
                <Text tx="receiptItemForm.searchableLabel" />
                <Switch
                  value={searchable}
                  onValueChange={(value) => {
                    setSearchable(value)
                  }}
                ></Switch>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button tx="common.add" onPress={handleSubmit} />
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    )
  }



  useEffect(() => {
    clearModalForm()
  }, [openedItem])
  // End Modal

  // Search
  const [searchQuery, setSearchQuery] = useState("")
  // Search Queries
  const searchResultBase = useQuery(
    ReceiptItem,
    (ReceiptItem) => {
      const query =
        "(title CONTAINS $0 OR description CONTAINS $0) AND searchable == $1 " 
        // `AND (NOT _id IN {${selectedItems.map((_, index) => `$${index + 2}`).join(",")}})`
      return ReceiptItem.filtered(
        query,
        searchQuery,
        true
      )
    },
    [searchQuery],
  )

  const searchResult = useMemo(()=>{
    const selectedIds = selectedItems.map(([_,i])=>i._id)
    return searchResultBase.filter((i)=>!selectedIds.includes(i._id.toHexString()))
  },[searchResultBase,selectedItems])

  const [expandedItem,setExpandedItem] = useState(0)
  return (
    <Screen style={$root} safeAreaEdges={["top"]} preset="fixed">
      <Surface>
        <View style={$header}>
          <IconButton icon="close" onPress={() => navigation.goBack()}></IconButton>
          <View>
            <Button mode="elevated" onPress={openModal} tx="common.new" />
          </View>
        </View>
        <Searchbar
          mode="bar"
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
        <List.Section>
          <List.Subheader>انتخاب شده ها</List.Subheader>
          <SelectedReceiptList expandedIndex={expandedItem} onExpandedIndexChange={(index)=>setExpandedItem(index)} listViewStyle={{ maxHeight: "40%", minHeight: 280 }} />

          <List.Subheader>نتایج جستجو</List.Subheader>
          {searchResult && (
            <ListView
              style={{ maxHeight: "40%", minHeight: 280 }}
              data={searchResult}
              renderItem={(info) => (
                <>
                  <List.Item
                    title={info.item.title}
                    key={info.item._id.toHexString()}
                    description={info.item.description}
                    right={() => {
                      if (info.item.defaultPrice) return <Text>{info.item.defaultPrice}</Text>
                    }}
                    onPress={() => {
                      addReceiptItem(info.item)
                      setExpandedItem(0)
                    }}
                  />
                  <Divider />
                </>
              )}
            />
          )}
        </List.Section>
      </Surface>
      {renderModal()}
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $header: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $switch: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center",
  margin: 7,
}

const $counterContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
}

const $itemContainer: ViewStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "row",
  padding: 5,
}
