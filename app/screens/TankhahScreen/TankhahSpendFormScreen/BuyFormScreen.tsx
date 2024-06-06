import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { Switch, View, ViewStyle } from "react-native"
import { Dialog, FAB, Portal, Surface } from "react-native-paper"
import { SelectedReceiptList } from "./SelectedReceiptList"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { SearchItemBottomSheetList } from "./SearchItemBottomSheetList"
import { useObject, useRealm } from "@realm/react"
import { TextField, CurrencyField, Button, Text } from "app/components"
import { ReceiptItem } from "app/models/realm/models"
import { BSON, UpdateMode } from "realm"
import { useStores } from "app/models"

// interface BuyFormScreenProps extends AppStackScreenProps<"TestScreen"> {}

export const BuyFormScreen: FC = observer(function BuyFormScreen() {
  const {
    spendFormStore: { addReceiptItem },
  } = useStores()
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  // variables
  const [fabOpen, setFabOpen] = useState(false)

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

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
        <Dialog visible={modalVisibility} onDismiss={closeModal}>
          <Dialog.Content>
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
          </Dialog.Content>
          <Dialog.Actions>
            <Button tx="common.add" onPress={handleSubmit} />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  }

  useEffect(() => {
    clearModalForm()
  }, [openedItem])
  return (
    <>
      <Surface style={$root}>
        <SelectedReceiptList listViewStyle={{ height: 460 }} />
      </Surface>
      <FAB.Group
        open={fabOpen}
        visible
        icon="magnify"
        actions={[
          {
            icon: "plus",
            onPress: openModal,
          },
        ]}
        onStateChange={({ open }) => {
          setFabOpen(open)
        }}
        onPress={() => {
          if (fabOpen) {
            handlePresentModalPress()
            // do something if the speed dial is open
          }
        }}
      />
      {renderModal()}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        enablePanDownToClose
        enableDynamicSizing
        keyboardBlurBehavior="restore"
      >
        <SearchItemBottomSheetList />
      </BottomSheetModal>
    </>
  )
})

const $root: ViewStyle = {
  width: "100%",
  height: "100%",
}

const $switch: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center",
  margin: 7,
}
