import React, {
  ComponentType,
  FC,
  forwardRef,
  Ref,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import {
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  Text,
} from "react-native"
import { isRTL, translate } from "../i18n"
import { colors, spacing, typography } from "../theme"
import { Button } from "."

export interface ButtonTabProps {
  /**
   * A style modifier for different input states.
   */
  items: Array<{ title: string , key: string }>
  value?: string
  onChangeValue: (i:{index: number, title: string, key: string})=>void
}

/**
 * A component that allows for the entering and editing of text.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/TextField/}
 * @param {TextFieldProps} props - The props for the `TextField` component.
 * @returns {JSX.Element} The rendered `TextField` component.
 */
export const ButtonSelect = forwardRef(function TextField(props: ButtonTabProps, ref: Ref<TextInput>) {
  const { value, items } = props
  const [selected, setSelected] = useState( items.findIndex(i=>i.key===value)||0)
  function pressHandler(index:number) {
    setSelected(index)
    props.onChangeValue({index, title: items[index].title, key: items[index].key})
  }

  return (
    <>
      <Text>روش پرداخت</Text>
      <View style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
        {items.map((item, index) => {
          return (
            <Button
              key={index}
              style={{
                backgroundColor: selected === index ? colors.tint : colors.background,
                minHeight: 42,
                height: 42,
              }}
              textStyle={{ fontSize: 16, textAlign: "center", margin: "auto" }}
              onPress={() => pressHandler(index)}
            >
              {item.title}
            </Button>
          )
        })}
      </View>
      {/* <View>{items[selected].content({})}</View> */}
    </>
  )
})

const $labelStyle: TextStyle = {
  marginBottom: spacing.xs,
}
