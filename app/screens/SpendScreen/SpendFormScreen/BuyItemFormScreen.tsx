import React, { FC, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, TextField, Text, Button, CurrencyField, ListView } from "app/components"
import {
  Searchbar,
  List,
  IconButton,
  Modal,
  Card,
  Switch,
  Portal,
  Surface,
  Divider,
  useTheme,
} from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { useObject, useQuery, useRealm } from "@realm/react"
import { BSON, Unmanaged, UpdateMode } from "realm"
import { ReceiptItem } from "app/models/realm/models"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { SelectedReceiptList } from "./SelectedReceiptList"
import { BottomSheetFlatList, BottomSheetTextInput } from "@gorhom/bottom-sheet"

// interface BuyItemFormScreenProps extends AppStackScreenProps<"BuyItemForm"> {}

export const BuyItemFormScreen: FC = observer(function BuyItemFormScreen() {
  // Pull in one of our MST stores
  const {
    spendFormStore: { receiptItemsArray: selectedItems, addReceiptItem },
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
      const _id = openedItem ? openedItem._id : new BSON.ObjectID()
      if (searchable) {
        realm.write(() => {
          return realm.create(
            "ReceiptItem",
            {
              _id,
              title,
              description,
              defaultPrice,
              searchable,
            },
            openedItem ? UpdateMode.Modified : undefined,
          )
        })
      }
      addReceiptItem({ title, price: defaultPrice, _id: _id.toHexString() })
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
        "(title CONTAINS $0 OR description CONTAINS $0) AND searchable == $1 SORT(createdAt DESC)"
      // `AND (NOT _id IN {${selectedItems.map((_, index) => `$${index + 2}`).join(",")}})`
      return ReceiptItem.filtered(query, searchQuery, true)
    },
    [searchQuery],
  )

  const searchResult = useMemo(() => {
    const selectedIds = selectedItems.map(([_, i]) => i._id)
    return searchResultBase.filter((i) => !selectedIds.includes(i._id.toHexString()))
  }, [searchResultBase, selectedItems])

  return (
    <>
      <Surface>
        <View style={$header}>
          <View style={{ alignSelf: "stretch", flexGrow: 2 }}>
            <TextField
              onChangeText={setSearchQuery}
              value={searchQuery}
              render={(props) => {
                return (
                  <BottomSheetTextInput
                    // mode="bar"
                    // placeholder="Search"
                    {...props}
                  />
                )
              }}
            />
          </View>
          <View>
            <Button mode="elevated" onPress={openModal} tx="common.new" />
          </View>
        </View>
      </Surface>

      {searchResult && (
        <BottomSheetFlatList
          style={{ backgroundColor:theme.colors.surface }}
          data={searchResult}
          scrollEnabled
          scrollToOverflowEnabled
          renderItem={({ item }) => (
            <>
              <List.Item
                title={item.title}
                key={item._id.toHexString()}
                description={item.description}
                right={() => {
                  if (item.defaultPrice) return <Text>{item.defaultPrice}</Text>
                }}
                onPress={() => {
                  addReceiptItem({
                    _id: item._id.toHexString(),
                    price: item.defaultPrice || 0,
                    title: item.title,
                  })
                }}
              />
              <Divider />
            </>
          )}
        />
      )}

      {renderModal()}
    </>
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
  paddingTop:2,
  paddingStart:2
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
