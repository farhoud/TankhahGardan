import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppNavigation, AppStackScreenProps } from "app/navigators"
import { DatePicker, ListView, Screen, Text } from "app/components"
import { Banner, Button, Dialog, Divider, List, Portal, ProgressBar, Surface } from "react-native-paper"
import { $row, } from "app/theme"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { TimeRangeBtn } from "app/components/TimeRangeBtn"
import { useRealm } from "@realm/react"
import { formatDate, formatDateIR } from "app/utils/formatDate"

interface TankhahArchiveScreenProps extends AppStackScreenProps<"TankhahArchive"> { }

export const TankhahArchiveScreen: FC<TankhahArchiveScreenProps> = observer(function TankhahArchiveScreen() {
  // Pull in one of our MST stores
  const { tankhahHomeStore: { archive: { startDate, endDate, confirm, spendSum, fundSum, diff, error, archiveList, setProp, archiveTankhahItems, clear, setRealm, showConfirm, archiving, progress } } } = useStores()
  const realm = useRealm()
  // Pull in navigation via hook
  const navigation = useNavigation<AppNavigation>()
  useEffect(() => {
    setRealm(realm)
    clear()
  }, [realm])

  return (
    <>
      <Banner actions={[
        {
          label: 'Ok',
          onPress: () => clear(),
        },
      ]} visible={!!error}>{error}</Banner>
      <Surface style={$root}>
        <View style={[$row, { paddingVertical: 10 }]}>
          <Text text="انتقال دوره به ارشیو" />
        </View>
        <View style={$row}>
          <DatePicker
            date={startDate}
            maxDate={endDate}
            onDateChange={(value) => {
              setProp("startDate", value)
            }}
            action={({ open, close, value }) => {
              return <TimeRangeBtn type="start" open={open} value={value} />
            }}
          />
          <DatePicker
            date={endDate}
            minDate={startDate}
            onDateChange={(value) => {
              setProp("endDate", value)
            }}
            action={({ open, close, value }) => {
              return <TimeRangeBtn type="end" open={open} value={value} />
            }}
          />
        </View>
        {archiving && <View style={[{ width: "100%", padding: 5 }]}>
          <ProgressBar progress={progress} ></ProgressBar>
        </View>}
        <Button disabled={archiving} onPress={() => showConfirm()}>شروع</Button>
        <Divider></Divider>
        <ListView
          ListHeaderComponent={() => (<Text>تاریخچه</Text>)}
          data={archiveList.slice()}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <List.Item
              title={`دوره ${formatDateIR(item.start)} - ${formatDateIR(item.end)}`} />
          )}
        />
      </Surface >
      <Portal>
        <Dialog visible={archiving && progress == 1} onDismiss={() => clear()}>
          <Dialog.Title>پایان</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">عملیات با موفیت پایان یافت</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => clear()}>جدید</Button>
            <Button onPress={() => navigation.goBack()}>بازگشت</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Dialog visible={confirm} onDismiss={() => setProp("confirm", false)}>
        <Dialog.Content>
          <Text variant="bodyLarge">‍‍بر اساس اطلاعات زیر مایل به ادامه عملیات هستید؟ </Text>
          <Text variant="bodyMedium">‍‍جمع مخارج: {spendSum.toLocaleString('fa-IR', { style: 'currency', currency: 'IRR' })}</Text>
          <Text variant="bodyMedium">‍‍جمع دریافتی: {fundSum.toLocaleString('fa-IR', { style: 'currency', currency: 'IRR' })}</Text>
          <Text variant="bodyMedium">‍‍اختلاف: {diff.toLocaleString('fa-IR', { style: 'currency', currency: 'IRR' })}</Text>
          <Text style={{ padding: 5 }} variant="bodyMedium">‍‍اختلاف به دوره بعدی منتقل نمیشود</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => archiveTankhahItems()}>ادامه</Button>
          <Button onPress={() => setProp("confirm", false)}>بستن</Button>
        </Dialog.Actions>
      </Dialog>
    </>
  )
})

const $root: ViewStyle = {
  flex: 1,
  padding: 2,
  justifyContent: "space-around"
}
