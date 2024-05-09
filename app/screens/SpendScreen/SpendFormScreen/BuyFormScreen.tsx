import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps, StackNavigation } from "app/navigators"
import { AutoComplete, DatePicker, Select, Text, TextField } from "app/components"
import { Badge, Button, FAB, Icon, List, Searchbar, Surface } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { PaymentMethod, Spend } from "app/models/realm/models"
import { useQuery } from "@realm/react"
import { SelectedReceiptList } from "./SelectedReceiptList"
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet"
import { BuyItemFormScreen } from "./BuyItemFormScreen"

// interface BuyFormScreenProps extends AppStackScreenProps<"TestScreen"> {}

export const BuyFormScreen: FC = observer(function BuyFormScreen() {
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  // variables
  const snapPoints = useMemo(() => ["25%", "50%"], [])

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  return (
    <>
      <Surface style={$root}>
        <SelectedReceiptList listViewStyle={{ height: 460 }} />
      </Surface>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        keyboardBlurBehavior="restore"
      >
        {/* <BottomSheetView > */}
        <BuyItemFormScreen />
        {/* </BottomSheetView> */}
      </BottomSheetModal>
      <FAB icon="plus" onPress={handlePresentModalPress} style={{ position: "absolute", bottom: 30, left: 30 }}></FAB>
    </>
  )
})

const $root: ViewStyle = {
  width: "100%",
  height: "100%",
}
