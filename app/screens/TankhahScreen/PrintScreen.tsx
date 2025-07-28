import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View } from "react-native"
import { Dialog, List, Menu, Portal, Surface, useTheme, Text } from "react-native-paper"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Button, DatePicker, ListView } from "app/components"
import { translate, TxKeyPath } from "app/i18n"
import { $row } from "app/theme"
import { formatDateIRDisplay } from "app/utils/formatDate"
import { useStores } from "app/models"
import { useRealm } from "@realm/react"

interface PrintScreenProps extends AppStackScreenProps<"Print"> { }

export const PrintScreen: FC<PrintScreenProps> = observer(function PrintScreen() {
  // Pull in one of our MST stores
  const { tankhahHomeStore: { print: {
    start,
    end,
    gpFilter,
    opFilter,
    selectedOpFilter,
    selectedGpFilter,
    gpFilterOpen,
    opFilterOpen,
    error,
    loading,
    selectGpFilter,
    selectOpFilter,
    print,
    setRealm,
    clear,
    setProp,
  } } } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()
  const realm = useRealm()

  const theme = useTheme()

  // Render functions
  const renderSelectGroup = () => (
    <Portal>
      <Dialog visible={gpFilterOpen} onDismiss={() => setProp("gpFilterOpen", !gpFilterOpen)}>
        <Dialog.ScrollArea>
          <ListView
            data={gpFilter.slice()}
            renderItem={({ item }) => (
              <List.Item
                title={item.id === "all" ? "همه" : item.name}
                onPress={() => selectGpFilter(item.id)}
              />
            )}
          />
        </Dialog.ScrollArea>
      </Dialog>
    </Portal>

  )


  const renderFilterMenu = () => {
    return (
      <Menu
        visible={opFilterOpen}
        onDismiss={() => setProp("opFilterOpen", false)}
        anchor={
          <Button
            // style={$controlsBtn}
            // buttonColor={theme.colors.onPrimary}
            textColor={theme.colors.primary}
            // mode="contained-tonal"
            onPress={() => setProp("opFilterOpen", !opFilterOpen)}
            icon="filter"
          >
            {translate(("opType." + selectedOpFilter?.name) as TxKeyPath)}
          </Button>
        }
      >
        {opFilter.map((i) => (
          <Menu.Item
            key={i.id}
            onPress={() => {
              selectOpFilter(i.id)
            }}
            title={translate(("opType." + i.id) as TxKeyPath)}
          />
        ))}
      </Menu>
    )
  }

  const renderTimeRangeBtn = (
    type: "start" | "end" = "start",
    open: () => void,
    value?: Date,
  ) => {
    return (
      <Button
        // style={$controlsBtn}
        onPress={open}
      >
        {(type === "start" ? " از " : "تا ") + (value ? formatDateIRDisplay(value, "dd MMM yy") : " : ")}
      </Button>
    )
  }

  const handlePrint = () => {
    print()
  }

  useEffect(() => {
    setRealm(realm)
    clear()
  }, [realm])

  return (
    <Screen style={$root} preset="fixed">
      {renderSelectGroup()}
      <Surface style={{ alignItems: "center" }}>

        <View style={{ minHeight: "100%", maxWidth: "70%", justifyContent: "space-around", alignItems: "center" }}>


          <Button
            // style={$controlsBtn}
            // buttonColor={theme.colors.onPrimary}
            textColor={theme.colors.primary}
            mode="contained-tonal"
            onPress={() => setProp("gpFilterOpen", true)}
            icon="filter"
            text={selectedGpFilter?.id == "all" ? "همه" : selectedGpFilter?.name}
          />

          <View style={$row}>
            <DatePicker
              date={start}
              maxDate={end}
              onDateChange={(value) => {
                setProp("start", value)
              }}
              action={({ open, close, value }) => {
                return renderTimeRangeBtn("start", open, value)
              }}
            />
            <DatePicker
              date={end}
              minDate={start}
              onDateChange={(value) => {
                setProp("end", value)
              }}
              action={({ open, close, value }) => renderTimeRangeBtn("end", open, value)}
            />
          </View>

          {renderFilterMenu()}
          <Button
            // style={$controlsBtn}
            // buttonColor={theme.colors.onPrimary}
            textColor={theme.colors.primary}
            // mode="contained-tonal"
            onPress={handlePrint}
            icon="printer"
            mode="contained-tonal"
            text="چاپ"
            loading={loading}
            disabled={loading}
          />
        </View>
      </Surface>
      <Portal>
        <Dialog visible={!!error} onDismiss={() => clear()}>
          <Dialog.Title>پایان</Dialog.Title>
          <Dialog.Content>
            <Text>{error}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => clear()}>باشه</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
