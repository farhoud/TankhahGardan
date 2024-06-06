import React, { Ref, forwardRef, useImperativeHandle, useMemo, useRef } from "react"
import { View, ViewStyle } from "react-native"
import { AppNavigation } from "app/navigators"
import { AutoComplete, Button, DatePicker, TextField,Text } from "app/components"
import { $row } from "app/theme"
import { Icon, useTheme } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { format } from "date-fns"
import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { BSON } from "realm"
import { useObject, useQuery, useRealm } from "@realm/react"
import { Attendance, Worker } from "app/models/realm/attendance"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { BottomSheetTextInputProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput"

interface AttendanceFormProps
  extends Omit<
    BottomSheetModalProps,
    "ref" | "enablePanDownToClose" | "enablePanDownToClose" | "backgroundStyle" | "children"
  > {
  onDone?: (value: Attendance) => void
}

export const AttendanceForm = observer(
  forwardRef(function AttendanceForm(_props: AttendanceFormProps, ref: Ref<BottomSheetModal>) {
    const { onDone, ...modalProps } = _props
    // Pull in one of our MST stores
    const {
      attendanceFormStore: {
        from,
        to,
        description,
        workerId,
        group,
        touched,
        isValid,
        errors,
        clear,
        submit,
        setProp,
        setGroup,
      },
    } = useStores()

    // Pull in navigation via hook
    const navigation = useNavigation<AppNavigation>()

    const theme = useTheme()

    const bottomSheetRef = useRef<BottomSheetModal>(null)
    useImperativeHandle(ref, () => bottomSheetRef.current as BottomSheetModal)

    const realm = useRealm()
    const worker = useObject(Worker, new BSON.ObjectID(workerId))
    const groups = useQuery(Attendance, (res) => {
      return res.filtered("group Contains $0 DISTINCT(group)",group)
    },[group])

    const isAvailable = useMemo(()=>{
      const condition = worker?.attendance.filtered('from BETWEEN {$0,$1} OR to BETWEEN {$0,$1}',from,to)
      return !condition?.length
    },[worker,from,to])


    const snapPoints = useMemo(() => ["38%", "60%"], [])
    return (
      <BottomSheetModal
        {...modalProps}
        enablePanDownToClose
        snapPoints={snapPoints}
        keyboardBlurBehavior="restore"
        keyboardBehavior="extend"
        ref={bottomSheetRef}
        enableDynamicSizing
        backgroundStyle={{ backgroundColor: theme.colors.background }}
      >
        <BottomSheetView>
          <View
            style={[
              $row,
              { justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10 },
            ]}
          >
            <Button
              mode="contained-tonal"
              onPress={() => {
                if (worker) {
                  const res = submit(realm, worker)
                  bottomSheetRef.current?.close()
                }
              }}
            >
              دخیره
            </Button>
          </View>
          <AutoComplete
            dense
            onChangeText={(value) => {
              setProp("group", value)
            }}
            suggestions={groups.map((i) => ({ title: i.group }))}
            placeholder="مکان"
            value={group}
            onSelect={(value) => setProp("group", value)}
          ></AutoComplete>
          <View style={[$row, { justifyContent: "flex-start", alignItems: "center" }]}>
            <Button
              icon={() => {
                return (
                  <View style={{ paddingBottom: 8 }}>
                    <Icon source="account" size={30} color={theme.colors.onSurface} />
                  </View>
                )
              }}
              textColor={isAvailable?theme.colors.onSurface:theme.colors.error}
              mode="text"
              onPress={() => {
                setProp("selecting",true)
                navigation.navigate("Worker", { mode: "select" })
              }}
            >
              {worker?.name || "انتخاب نیرو"}
            </Button>
            {!isAvailable && <Text variant="labelLarge" text="در این بازه زمانی مشغول است" style={{color:theme.colors.error}}></Text>}
          </View>
          <View
            style={{
              justifyContent: "flex-start",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <DatePicker
              date={from}
              onDateChange={(value) => {
                setProp("from", value)
              }}
              modalMode="time"
              action={({ open, close, value }) => {
                return (
                  <Button
                    icon={() => {
                      return (
                        <View style={{ paddingBottom: 8 }}>
                          <Icon
                            source="arrow-collapse-right"
                            size={30}
                            color={theme.colors.onSurface}
                          />
                        </View>
                      )
                    }}
                    mode="text"
                    text={format(value, "HH:mm")}
                    onPress={open}
                    textColor={theme.colors.onSurface}
                  />
                )
              }}
            />
            <DatePicker
              date={to}
              modalMode="time"
              onDateChange={(value) => {
                setProp("to", value)
              }}
              action={({ open, close, value }) => {
                return (
                  <Button
                    icon={() => {
                      return (
                        <View style={{ paddingBottom: 8 }}>
                          <Icon
                            source="arrow-collapse-left"
                            size={30}
                            color={theme.colors.onSurface}
                          />
                        </View>
                      )
                    }}
                    mode="text"
                    textColor={theme.colors.onSurface}
                    text={format(value, "HH:mm")}
                    onPress={open}
                  />
                )
              }}
            />
          </View>
          <TextField
            label="توضیحات"
            value={description}
            onChangeText={(value) => {
              setProp("description", value)
            }}
            multiline
            numberOfLines={1}
            render={(props) => {
              
              return <BottomSheetTextInput {...props as BottomSheetTextInputProps}></BottomSheetTextInput>
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    )
  }),
)

const $root: ViewStyle = {
  flex: 1,
}
