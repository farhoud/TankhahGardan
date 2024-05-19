import React, { FC, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { TextField, Text } from "app/components"
import { List, Divider, useTheme } from "react-native-paper"
import { useQuery } from "@realm/react"
import { ReceiptItem } from "app/models/realm/models"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { BottomSheetFlatList, BottomSheetTextInput } from "@gorhom/bottom-sheet"

// interface BuyItemFormScreenProps extends AppStackScreenProps<"BuyItemForm"> {}

export const BuyItemFormScreen: FC = observer(function BuyItemFormScreen() {
  // Pull in one of our MST stores
  const {
    spendFormStore: { receiptItemsArray: selectedItems, addReceiptItem },
  } = useStores()

  const theme = useTheme()

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

      {searchResult && (
        <BottomSheetFlatList
          style={{ backgroundColor: theme.colors.surface }}
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
  paddingTop: 2,
  paddingStart: 2,
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
