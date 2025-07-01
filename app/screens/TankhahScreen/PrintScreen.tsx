import React, { FC, useCallback, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View } from "react-native"
import { Dialog, List, Menu, Portal, Surface, useTheme } from "react-native-paper"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Button, DatePicker, ListView } from "app/components"
import { translate, TxKeyPath } from "app/i18n"
import { $row } from "app/theme"
import { formatDateIR, formatDateIRDisplay } from "app/utils/formatDate"
import { useStores } from "app/models"
import { useQuery, useRealm } from "@realm/react"
import { TankhahItem } from "app/models/realm/tankhah"
import { usePrint } from "app/utils/usePrint"
// import { useNavigation } from "@react-navigation/native"


enum FilterEnum {
  spend = "spend",
  fund = "fund",
}

type ItemFilterPreset = "spend" | "fund"


interface PrintScreenProps extends AppStackScreenProps<"Print"> { }

export const PrintScreen: FC<PrintScreenProps> = observer(function PrintScreen() {
  // Pull in one of our MST stores
  const { tankhahHomeStore: { startDate, endDate, selectedGroup, setProp } } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()

  const theme = useTheme()
  const realm = useRealm()
  const printer = usePrint()

  // Component States
  const [openFilterMenu, setOpenFilterMenu] = useState(false)
  const [selectedFilter, setSeletectedFilter] = useState<ItemFilterPreset>("fund")
  const [groupSelectVisible, setGroupSelectVisible] = useState(false)

  // Queries
  const spendGroupsNames = useQuery({
    type: TankhahItem, query: (spends) =>
      spends.filtered('group.name CONTAINS "" AND opType != "fund" DISTINCT(group)')
  })
    .map((i) => i.group?.name || "no_group")

  const groupNames: string[] = useMemo<string[]>(
    () => ["all", ...spendGroupsNames],
    [spendGroupsNames],
  )
  const getQueryString = (
    startDate: Date,
    endDate: Date,
    filter?: ItemFilterPreset,
    group?: string,
  ): [string, ...Array<Date | string>] => {
    const baseQuery = "doneAt BETWEEN { $0 , $1 } SORT(doneAt ASC)"
    let query = baseQuery
    const args: Array<Date | string> = [startDate, endDate]
    switch (filter) {
      case "fund":
        query = `opType == "${filter}" AND ` + query
        break
      default:
        query = 'opType != "fund" AND ' + query
    }
    if (group && group !== "all") {
      query = "group.name == $2 AND " + query
      args.push(group)
    }
    return [query, ...args]
  }


  // Actions
  const handleToggleFilterMenu = () => {
    setOpenFilterMenu((prev) => !prev)
  }

  const handleSelectFilter = (i: ItemFilterPreset) => () => {
    setSeletectedFilter(i)
    setOpenFilterMenu(false)
  }

  const changeSelectGroupVisibility = (visibility: boolean) => () => {
    setGroupSelectVisible(visibility)
  }

  const changeGroup = (index: number) => () => {
    setProp("selectedGroup", index)
    setGroupSelectVisible(false)
  }

  // Render functions
  const renderSelectGroup = useCallback(() => (
    <Portal>
      <Dialog visible={groupSelectVisible} onDismiss={changeSelectGroupVisibility(false)}>
        <Dialog.ScrollArea>
          <ListView
            data={groupNames}
            renderItem={(info) => (
              <List.Item
                title={info.item === "all" ? "همه" : info.item}
                onPress={changeGroup(info.index)}
              />
            )}
          />
        </Dialog.ScrollArea>
      </Dialog>
    </Portal>

  ), [groupNames, selectedGroup])


  const renderFilterMenu = useCallback(() => {
    return (

      <Menu
        visible={openFilterMenu}
        onDismiss={handleToggleFilterMenu}
        anchor={
          <Button
            // style={$controlsBtn}
            // buttonColor={theme.colors.onPrimary}
            textColor={theme.colors.primary}
            // mode="contained-tonal"
            onPress={handleToggleFilterMenu}
            icon="filter"
          >
            {translate(("opType." + selectedFilter) as TxKeyPath)}
          </Button>
        }
      >
        {Object.keys(FilterEnum).map((i) => (
          <Menu.Item
            key={i}
            onPress={handleSelectFilter(i as ItemFilterPreset)}
            title={translate(("opType." + i) as TxKeyPath)}
          />
        ))}
      </Menu>
    )
  }, [openFilterMenu, selectedFilter])

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
    const items = realm
      .objects(TankhahItem)
      .filtered(...getQueryString(startDate, endDate, selectedFilter, groupNames[selectedGroup])).map((item) => {
        const mapInfo = {
          fund: `دریافت`,
          buy: `${item.receiptItems?.map((i) => `${i.title}`).join("، ")}`,
          transfer: `${translate(
            ("paymentMethod." + item.paymentMethod) as TxKeyPath,
          )} به ${item.recipient || item.accountNum || "نامشخص"}`,
        }
        return {
          date: formatDateIR(item.doneAt),
          opType: item.opType,
          amount: String(item.amount),
          fee: String(item.transferFee),
          description: item.description || "",
          info: mapInfo[item.opType],
        }
      })
    switch (selectedFilter) {
      case "spend":
        const totalSpend = realm
          .objects(TankhahItem)
          .filtered(...getQueryString(startDate, endDate, "spend", groupNames[selectedGroup]))
          .sum("total")
        printer.printTankhahSpends(items, totalSpend, groupNames[selectedGroup], formatDateIR(startDate), formatDateIR(endDate))
      case "fund":
        const totalFund = realm
          .objects(TankhahItem)
          .filtered(...getQueryString(startDate, endDate, "fund"))
          .sum("total")
        printer.printTankhahFunds(items, String(totalFund), formatDateIR(startDate), formatDateIR(endDate))
    }
  }

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
            onPress={changeSelectGroupVisibility(true)}
            icon="filter"
            text={groupNames[selectedGroup] == "all" ? "همه" : groupNames[selectedGroup]}
          />

          <View style={$row}>
            <DatePicker
              date={startDate}
              maxDate={endDate}
              onDateChange={(value) => {
                setProp("startDate", value)
              }}
              action={({ open, close, value }) => {
                return renderTimeRangeBtn("start", open, value)
              }}
            />
            <DatePicker
              date={endDate}
              minDate={startDate}
              onDateChange={(value) => {
                setProp("endDate", value)
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
          />
        </View>
      </Surface>

    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
