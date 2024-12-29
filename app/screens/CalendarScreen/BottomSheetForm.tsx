import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { BottomSheet } from "app/components"
import { useStores } from "app/models"
import { Attendance, Event, Task } from "app/models/realm/calendar"
import { observer } from "mobx-react-lite"
import {Ref, forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { CalendarForm, CalendarFormProps } from "./CalendarForm"
import { useNavigation } from "@react-navigation/native"
import { AppNavigation } from "app/navigators"

export interface BottomSheetFormRef {
  newForm: () => void
  editForm: (item: Attendance | Event | Task) => void
}

export interface BottomSheetFormProps {
    onDone?:CalendarFormProps["onDone"]
}

export const BottomSheetForm = observer(
  forwardRef(function BottomSheetForm(props: BottomSheetFormProps, ref: Ref<BottomSheetFormRef>) {
    const {onDone=()=>{}} = props
    const navigation = useNavigation<AppNavigation>()
    const {
      calendarStore: {
        setProp,
        load,
        clear,
        selecting,
      },
    } = useStores()

    const bottomSheetRef = useRef<BottomSheetModal>(null)

    useImperativeHandle(ref, () => ({
      newForm,
      editForm,
    }))

    const newForm = () => {
      clear()
      bottomSheetRef.current?.present()
    }
    const editForm = (item: Attendance | Event | Task) => {
      load(item)
      bottomSheetRef.current?.present()
    }
    useEffect(() => {
      const unsubscribe1 = navigation.addListener("focus", (e) => {
        if (selecting) {
          bottomSheetRef.current?.present()
        }
        setProp("selecting", false)
      })

      const unsubscribe2 = navigation.addListener("blur", (e) => {
        bottomSheetRef.current?.dismiss()
      })

      return () => {
        unsubscribe1()
        unsubscribe2()
      }
    }, [navigation, selecting, setProp])

    return (
      <BottomSheet onDismiss={() => !selecting && clear()} ref={bottomSheetRef}>
        <CalendarForm
          onDone={(value) => {
            bottomSheetRef.current?.close()
            clear()
            onDone(value)
          }}
        ></CalendarForm>
      </BottomSheet>
    )
  }),
)
