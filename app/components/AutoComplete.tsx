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
import { TextFieldProps, TextField } from "."
import { Card, Divider, List, Modal, Portal } from "react-native-paper"

export interface AutoCompleteProps extends Omit<TextFieldProps, "ref"> {
  suggestions?: Array<{ title: string }>
  onSelect?: (text: string) => void
  onDropdownChange?: (state: "opened" | "closed") => void
  style?: StyleProp<TextStyle>
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
    suggestions,
    value,
    onChangeText,
    onSelect,
    onDropdownChange,
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

  return (
    <>
      <TextField
        showSoftInputOnFocus={false}
        onPressIn={openModal}
        value={value}
        onChangeText={onChangeText}
        ref={inputRef}
        onFocus={(e) => {
          // e.preventDefualt
          modalInputRef.current?.focus()
        }}
        {...TextInputProps}
      />
      <Portal>
        <Modal
          style={{
            flex: 1,
            paddingHorizontal:"5%",
            paddingBottom:"40%",
          }}
          visible={modalShow}
          onDismiss={closeModal}
          contentContainerStyle={{
            flex:1,
            display:"flex",
            justifyContent: "center",
            alignSelf:"stretch",
          }}
        >
          <KeyboardAvoidingView
            behavior={"padding"}
          >
            <Card mode="contained">
              <Card.Content>
                <TextField
                  ref={modalInputRef}
                  autoFocus
                  value={value}
                  onChangeText={onChangeText}
                  // {...TextInputProps}
                />
                {value && !names?.includes(value) && (
                  <>
                    <List.Item
                      onPress={() => selectSuggestion(value)}
                      left={() => <List.Icon icon="account-plus" />}
                      // textStyle={{ textAlign: "center", fontSize: 14 }}
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

            {/* <View style={{height:150}} pointerEvents="box-none">

            </View> */}
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
    </>
  )
})

const styles = StyleSheet.create({
  centerSubContainer: {
    elevation: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
})
