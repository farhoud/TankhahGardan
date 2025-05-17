import React, { forwardRef, Ref, useImperativeHandle, useMemo, useRef, useState } from "react"
import { StyleProp, TextInput as RNTextInput, TextStyle, ScrollView, KeyboardAvoidingView } from "react-native"
import { TextFieldProps, TextField, AccountNumField } from "."
import { Dialog, Divider, List, Portal } from "react-native-paper"
import { PaymentMethod } from "app/models/realm/tankhah"

export interface AutoCompleteProps extends Omit<TextFieldProps, "ref"> {
  suggestions?: Array<{ title: string }>
  onSelect?: (text: string) => void
  onDropdownChange?: (state: "opened" | "closed") => void
  style?: StyleProp<TextStyle>
  type?: PaymentMethod
}

/**
 * A component that allows for the entering and editing of text.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/TextField/}
 * @param {AutoCompleteProps} props - The props for the `TextField` component.
 * @returns {JSX.Element} The rendered `TextField` component.
 */
export const AutoComplete = forwardRef(function AutoComplete(
  props: AutoCompleteProps,
  ref: Ref<RNTextInput>,
) {
  const {
    type,
    suggestions,
    value,
    onChangeText,
    onSelect,
    onDropdownChange,
    onFocus,
    style: $inputStyleOverride,
    ...TextInputProps
  } = props
  const inputRef = useRef<RNTextInput>(null)
  const modalInputRef = useRef<RNTextInput>(null)

  const [modalShow, setModalShow] = useState(false)

  function selectSuggestion(text: string) {
    closeModal()
    props.onSelect && props.onSelect(text)
  }

  const openModal = () => {
    setModalShow(true)
  }

  const closeModal = () => {
    setModalShow(false)
  }

  useImperativeHandle(ref, () => inputRef.current as RNTextInput)

  const names = useMemo(() => {
    return suggestions?.flatMap((i) => i.title)
  }, [suggestions])

  const Input = useMemo(() => {
    return type ? AccountNumField : TextField
  }, [type])

  return (
    <>
      <Input
        paymentMethod={type}
        showSoftInputOnFocus={false}
        onPressIn={openModal}
        value={value}
        onChangeText={(text) => {
          onChangeText && onChangeText(text)
        }}
        ref={inputRef}
        onFocus={(e) => {
          onFocus && onFocus(e)
        }}
        {...TextInputProps}
      />
      <Portal>
        <Dialog visible={modalShow} onDismiss={closeModal}>
          <Dialog.Content>
            <Input
              paymentMethod={type}
              ref={modalInputRef}
              value={value}
              onChangeText={onChangeText}
              onFocus={onFocus}
              {...TextInputProps}
            />
            <KeyboardAvoidingView style={{ flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={100}>
              <ScrollView>
                {value && !names?.includes(value) && (
                  <>
                    <List.Item
                      onPress={() => selectSuggestion(value)}
                      left={() => <List.Icon icon="account-plus" />}
                      description="جدید"
                      title={value}
                    />
                    <Divider />
                  </>
                )}
                {suggestions?.map((item, index) => {
                  return (
                    <List.Item
                      key={index}
                      onPress={() => selectSuggestion(item.title)}
                      title={item.title}
                    />
                  )
                })}
              </ScrollView>
            </KeyboardAvoidingView>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </>
  )
})
