import { CurrencyField, ListView, TextField, Text } from "app/components"
import { observer } from "mobx-react-lite"
import { FC, useMemo, useRef } from "react"
import { useStores } from "app/models"
import { RectButton, Swipeable } from "react-native-gesture-handler"
import { Divider, Icon, IconButton, List, Surface, useTheme } from "react-native-paper"
import { Animated, TextInput, TextStyle, View, ViewStyle } from "react-native"
import { spacing } from "app/theme"

type AnimatedInterpolation = Animated.AnimatedInterpolation<string | number>

interface Props {
  listViewStyle?: ViewStyle
}

export const SelectedReceiptList: FC<Props> = observer(function SelectedReceiptList(props) {
  const { listViewStyle } = props
  const {
    spendFormStore: { receiptItemsArray: selectedItems, removeReceiptItem },
  } = useStores()
  const theme = useTheme()

  const renderItemActions =
    (item: string) => (progress: AnimatedInterpolation, dragX: AnimatedInterpolation) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100, 101],
        outputRange: [0, 5, 10, 15],
      })
      return (
        <RectButton
          style={{ backgroundColor: theme.colors.surfaceVariant }}
          onPress={() => {
            removeReceiptItem(item)
          }}
        >
          <IconButton animated icon="delete"></IconButton>
        </RectButton>
      )
    }

  return (
    <ListView
      style={listViewStyle}
      data={selectedItems}
      ListEmptyComponent={<Text style={$emptyContent}>لطفا اجناس خریداری شده را اضافه کنید</Text>}
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
            leftThreshold={160}
            rightThreshold={160}
          >
            <ReceiptForm itemKey={keys}></ReceiptForm>

            <Divider style={{ margin: 2 }} />
          </Swipeable>
        )
      }}
    />
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
const $emptyContent: TextStyle = { textAlign: "center", padding: spacing.lg }

type ReceiptFormProps = {
  itemKey: string
}

const ReceiptForm: FC<ReceiptFormProps> = observer(function ReceiptFormProps(props) {
  const { itemKey } = props
  const {
    spendFormStore: { itemByKeys, expandedItemKey, expand },
  } = useStores()
  const theme = useTheme()
  const item = useMemo(() => itemByKeys(itemKey), [itemKey])
  const textRef = useRef<TextInput>(null)

  return (
    <List.Accordion
      style={{ display: "flex", backgroundColor: theme.colors.surfaceVariant, height: 50 }}
      expanded={expandedItemKey === itemKey}
      onPress={() => expand(itemKey)}
      // description={i.amount}
      right={({ isExpanded }) => {
        return (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              marginBottom: -5,
              marginTop: -5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {!isExpanded && (
              <Text
                style={{ width: 100, textAlign: "center" }}
              >{`${item?.amount} X ${item?.price}`}</Text>
            )}
            <Icon source={isExpanded ? "chevron-up" : "chevron-down"} size={20}></Icon>
          </View>
        )
      }}
      title={<Text> {item?.title} </Text>}
    >
      <Surface elevation={1} style={$itemContainer}>
        <View style={{ flexGrow: 2 }}>
          <CurrencyField
            label="قیمت"
            dense
            value={item?.price || 0}
            onChangeValue={(value) => {
              item?.setProp("price", value)
            }}
          ></CurrencyField>
        </View>
        <View style={$counterContainer}>
          {/* <IconButton icon="plus" size={15} mode="contained" /> */}
          <TextField
            ref={textRef}
            dense
            label="مقدار"
            value={item?.amount.toString()}
            keyboardType="numeric"
            onChangeText={(value) => {
              item?.setProp("amount", Number(value))
            }}
            helper="  "
            onFocus={(e)=>{
              textRef?.current?.clear()
            }}
          />
        </View>
      </Surface>
    </List.Accordion>
  )
})
