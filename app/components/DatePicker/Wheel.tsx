import React, { FC, useState } from "react"
import { Pressable } from "react-native"
import { List, Menu } from "react-native-paper"
import { TextField } from "../TextField"
import { spacing } from "app/theme"



interface WheelProps {
  range: [number, number]
  value?: number
  onScroll?: (size: number) => void
}

export const Wheel: FC<WheelProps> = (_props) => {
  const {
    range: [start, end],
    value,
    onScroll,
  } = _props

  const [visible, setVisible] = useState(false)
 
  return (
    <Menu
      onDismiss={() => {
        setVisible(false)
      }}
      visible={visible}
      contentStyle={{ width: 60 }}
      anchor={
        <Pressable
          onPressIn={() => {
            setVisible(true)
          }}
        >
          <TextField
            dense
            style={{marginHorizontal:spacing.xs}}
            showSoftInputOnFocus={false}
            editable={false}
            value={value?.toString().padStart(2,"0")}
            pointerEvents="box-none"
          />
        </Pressable>
      }
      anchorPosition="bottom"
    >
      {getIndicesArray(end - start + 1).map((item) => {
        return (
          <List.Item
            onPress={() => {
              onScroll && onScroll(item + start)
              setVisible(false)
            }}
            key={item}
            style={{ width: 100 }}
            titleStyle={{ fontFamily: "IRANSansXFaNum-Regular" }}
            // onPress={() => {}}
            title={(item + start).toString().padStart(2, "0")}
          />
        )
      })}
    </Menu>
  )
}


const getIndicesArray = (length: number) => Array.from({ length }, (_, i) => i)
