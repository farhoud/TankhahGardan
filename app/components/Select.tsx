import React, { forwardRef, Ref, useImperativeHandle, useMemo, useRef, useState } from "react"
import { StyleProp, TextStyle, TextInput as RNTextInput, ViewStyle } from "react-native"
import { TextProps, TextField, TextFieldProps } from "."
import { Menu } from "react-native-paper"

export interface Option {
  value: string
  label: string
}

export interface SelectProps extends Omit<TextFieldProps, "ref" | "value" | "onChange"> {
  value?: string
  onSelect?: (item: string) => void
  options?: Array<Option>
  onDropdownChange?: (state: "opened" | "closed") => void
  /**
   * The label text to display if not using `labelTx`.
   */
  label?: TextProps["text"]
  /**
   * Label text which is looked up via i18n.
   */
  labelTx?: TextProps["tx"]
  /**
   * Optional label options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  labelTxOptions?: TextProps["txOptions"]
  /**
   * Pass any additional props directly to the label Text component.
   */
  LabelTextProps?: TextProps
  /**
   * The helper text to display if not using `helperTx`.
   */
  helper?: TextProps["text"]
  /**
   * Helper text which is looked up via i18n.
   */
  helperTx?: TextProps["tx"]
  /**
   * Optional helper options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  helperTxOptions?: TextProps["txOptions"]
  /**
   * Pass any additional props directly to the helper Text component.
   */
  HelperTextProps?: TextProps
  /**
   * The placeholder text to display if not using `placeholderTx`.
   */
  placeholder?: TextProps["text"]
  /**
   * Placeholder text which is looked up via i18n.
   */
  placeholderTx?: TextProps["tx"]
  /**
   * Optional placeholder options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  placeholderTxOptions?: TextProps["txOptions"]
  /**
   * Optional input style override.
   */
  style?: StyleProp<TextStyle>
  /**
   * Style overrides for the container
   */
  containerStyle?: StyleProp<ViewStyle>
}

/**
 * A component that allows for the entering and editing of text.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/TextField/}
 * @param {SelectProps} props - The props for the `TextField` component.
 * @returns {JSX.Element} The rendered `TextField` component.
 */
export const Select = forwardRef(function Select(props: SelectProps, ref: Ref<RNTextInput>) {
  const {
    value,
    onSelect,
    options,
    onDropdownChange,
    editable,
    style: $inputStyleOverride,
    containerStyle: $containerStyleOverride,
    ...TextInputProps
  } = props
  const input = useRef<RNTextInput>(null)

  const [visible, setVisible] = useState(false)

  useImperativeHandle(ref, () => input.current as RNTextInput)

  function handleSelectOption(opt: Option) {
    setVisible(false)
    onSelect && onSelect(opt.value)
  }

  function handleOpenMenu() {
    setVisible(true)
    onDropdownChange && onDropdownChange("opened")
  }

  function handleCloseMenu() {
    setVisible(false)
    onDropdownChange && onDropdownChange("closed")
  }

  const valueMap = useMemo(()=>{
    const keyMap:Record<string,string>= {}
    if(!options){
      return keyMap
    }
    for(const item of options){
      keyMap[item.value]=item.label
    }
    return keyMap
  },[options])

  return (
    <Menu
      visible={visible}
      onDismiss={handleCloseMenu}
      anchor={
        <TextField
          value={value&&valueMap[value]}
          showSoftInputOnFocus={false}
          ref={input}
          onPressIn={handleOpenMenu}
          editable={!!options?.length}
          mode={TextInputProps.mode || "outlined"}
          {...TextInputProps}
        ></TextField>
      }
      style={{ width: "95%" }}
    >
      {options?.map((option) => {
        return (
          <Menu.Item
            key={option.value}
            onPress={() => handleSelectOption(option)}
            title={option.label}
          />
        )
      })}
    </Menu>
  )
})
