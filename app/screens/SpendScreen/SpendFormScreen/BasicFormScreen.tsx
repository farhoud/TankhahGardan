import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { AutoComplete, DatePicker, Select, Text, TextField } from "app/components"
import { Appbar, Surface } from "react-native-paper"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { PaymentMethod, PaymentType, Spend } from "app/models/realm/models"
import { useQuery } from "@realm/react"

interface BasicFormScreenProps extends AppStackScreenProps<"TestScreen"> {}

export const BasicFormScreen: FC<BasicFormScreenProps> = observer(function BasicFormScreen() {
  // Pull in one of our MST stores
  const {
    spendFormStore: { doneAt, paymentType, paymentMethod, group, title, setProp, errors },
  } = useStores()

  const groupSuggestions = useQuery(
    Spend,
    (spends) => {
      return spends.filtered(
        "group CONTAINS $0 AND group != '' SORT(doneAt DESC) DISTINCT(group) LIMIT(5)",
        group,
      )
    },
    [group],
  )

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <View style={$root}>
      <Surface>
        <DatePicker
          date={doneAt}
          onDateChange={(date) => {
            setProp("doneAt", date)
          }}
          error={!!errors?.doneAt}
          label="Name"
          labelTx="tankhahChargeScreen.dateLabel"
          placeholderTx="tankhahChargeScreen.datePlaceholder"
        />
        <Select
          options={[
            { value: "buy", label: "پرداخت" },
            { value: "transfer", label: "خرید" },
          ]}
          label="نوع عملیات"
          value={paymentType}
          onSelect={(value) => {
            setProp("paymentType", value as PaymentType)
          }}
        />
        <Select
          options={[
            { value: "satna", label: "ساتنا" },
            { value: "paya", label: "پایا" },
            { value: "ctc", label: "کارت به کارت" },
            { value: "cash", label: "نقد" },
            { value: "other", label: "دیگر" },
          ]}
          label="روش پرداخت"
          value={paymentMethod}
          onSelect={(value) => {
            setProp("paymentMethod", value as PaymentMethod)
          }}
        />
        <AutoComplete
          value={group}
          onChangeText={(value) => setProp("group", value)}
          // error={!!errors?.group}
          suggestions={groupSuggestions.map((i) => {
            return { title: i.group || "" }
          })}
          onSelect={(value) => {
            setProp("group", value as PaymentMethod)
          }}
          label="Name"
          labelTx="tankhahSpendFormScreen.groupLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.groupPlaceholder"
        />
        <TextField
          value={title}
          onChangeText={(value) => setProp("title", value)}
          label="Name"
          labelTx="tankhahSpendFormScreen.titleLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.titlePlaceholder"
        />
      </Surface>
    </View>
  )
})

const $root: ViewStyle = {
  width: "100%",
  height: "100%",
}
