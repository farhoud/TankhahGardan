import { CurrencyField, ListView, TextField } from "app/components"
import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { useStores } from "app/models"
import { GestureHandlerGestureEvent, RectButton, Swipeable } from "react-native-gesture-handler"
import { Divider, IconButton, List, Surface, useTheme } from "react-native-paper"
import { Animated, GestureResponderEvent, View, ViewStyle } from "react-native"

type AnimatedInterpolation = Animated.AnimatedInterpolation<string | number>

interface Props {
  listViewStyle?: ViewStyle
  expandedIndex?: number
  onExpandedIndexChange?: (index:number)=>void
}

export const SelectedReceiptList: FC<Props> = observer(function SelectedReceiptList(props) {
  const {listViewStyle, expandedIndex, onExpandedIndexChange} = props
  const {
    spendFormStore: { receiptItemsArray: selectedItems, addReceiptItem, removeReceiptItem },
  } = useStores()
  const theme = useTheme()
  const [itemCount, setItemCount] = useState<string>("10")
  const renderReceiptInput = () => {
    return (
      <Surface elevation={1} style={$itemContainer}>
        <View style={{ flexGrow: 2 }}>
          <CurrencyField label="قیمت" dense value={100} onChangeValue={() => {}}></CurrencyField>
        </View>
        <View style={$counterContainer}>
          {/* <IconButton icon="plus" size={15} mode="contained" /> */}
          <TextField
            dense
            label="مقدار"
            value={itemCount}
            onChangeText={(value) => {
              setItemCount(value)
            }}
            helper="  "
          />
          {/* <IconButton icon="minus" size={15} mode="contained" /> */}
        </View>
      </Surface>
    )
  }
  const renderItemActions =
    (key: string) => (progress: AnimatedInterpolation, dragX: AnimatedInterpolation) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100, 101],
        outputRange: [0, 5, 10, 15],
      })
      return (
        <RectButton
          style={{ backgroundColor: theme.colors.surfaceVariant }}
          onPress={() => {
            removeReceiptItem(key)
          }}
        >
          <IconButton animated icon="delete"></IconButton>
        </RectButton>
      )
    }

  const expandItem = (index: number) => (e: GestureResponderEvent) => {
    onExpandedIndexChange && onExpandedIndexChange( expandedIndex === index ? -1 : index)
  }

  return (
    <>
      {!!selectedItems.length && (
        <ListView
          style={listViewStyle}
          data={selectedItems}
          scrollToOverflowEnabled
          renderItem={({ item: [keys, i], index }) => {
            return (
              <Swipeable
                key={keys}
                renderLeftActions={renderItemActions(keys)}
                renderRightActions={renderItemActions(keys)}
                onSwipeableWillOpen={() => {
                  removeReceiptItem(keys)
                }}
                leftThreshold={180}
                rightThreshold={180}
              >
                <List.Accordion
                  style={{ backgroundColor: theme.colors.surfaceVariant }}
                  expanded={expandedIndex === index}
                  onPress={expandItem(index)}
                  title={i.title}
                  id={index}
                  key={i._id}
                >
                  {renderReceiptInput()}
                </List.Accordion>

                <Divider style={{ margin: 2 }} />
              </Swipeable>
            )
          }}
        />
      )}
    </>
  )
})

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
