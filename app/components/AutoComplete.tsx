import React, { forwardRef, Ref, useImperativeHandle, useMemo, useRef, useState } from "react"
import {
  StyleProp,
  TextInput as RNTextInput,
  TextStyle,
  KeyboardAvoidingViewComponent,
  StyleSheet,
  KeyboardAvoidingView,
  View,
} from "react-native"
import { TextFieldProps, TextField, AccountNumFieldProps, AccountNumField } from "."
import { Card, Divider, List, Modal, Portal } from "react-native-paper"
import { AccountNumType, PaymentMethod } from "app/models/realm/models"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"

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

  const insets = useSafeAreaInsets()

  return (
    <>
      <Input
        paymentMethod={type}
        showSoftInputOnFocus={false}
        onPressIn={openModal}
        value={value}
        onChangeText={onChangeText}
        ref={inputRef}
        onFocus={(e) => {
          onFocus && onFocus(e)
          modalInputRef.current?.focus()
        }}
        {...TextInputProps}
      />
      <Portal>
        <Modal
          style={{
            flex: 1,
            paddingHorizontal: "6%",
            paddingBottom: insets.bottom,
          }}
          visible={modalShow}
          onDismiss={closeModal}
          contentContainerStyle={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <KeyboardAvoidingView behavior={"padding"}>
            <Card mode="contained">
              <Card.Content>
                <Input
                  paymentMethod={type}
                  ref={modalInputRef}
                  autoFocus
                  value={value}
                  onChangeText={onChangeText}
                  onFocus={onFocus}
                  {...TextInputProps}
                />
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
              </Card.Content>
            </Card>
            <TouchableWithoutFeedback
              onPress={closeModal}
              style={{ height: 100 }}
            ></TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
    </>
  )
})
