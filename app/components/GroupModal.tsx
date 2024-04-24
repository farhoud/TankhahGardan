import * as React from "react"
import { Modal, StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, typography } from "app/theme"
import { Text } from "app/components/Text"
import { TextField } from "./TextField"
import { ListView } from "./ListView"
import { ListItem } from "./ListItem"

export interface GroupModalProps extends Modal {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const GroupModal = observer(function GroupModal(props: GroupModalProps) {
  const { style, ...modalProps } = props
  const $styles = [$container, style]
  // const listItems =

  return (
    <View style={$styles}>
      <Modal {...modalProps} style={$modalContainer}>
        <TextField></TextField>
        <ListView
          renderItem={({ item }) => {
            return <ListItem text={item.title}></ListItem>
          }}
          data={[
            { title: "ساختمان ۱", key: "1" },
            { title: "ساختمان 2", key: "2" },
          ]}
        ></ListView>
      </Modal>
    </View>
  )
})

const $container: ViewStyle = {
  justifyContent: "center",
}

const $text: TextStyle = {
  fontFamily: typography.primary.normal,
  fontSize: 14,
  color: colors.palette.primary500,
}

const $modalContainer: ViewStyle = {
  margin: 20,
  backgroundColor: "white",
  borderRadius: 20,
  padding: 35,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
}
