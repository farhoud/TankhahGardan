import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps, StackNavigation } from "app/navigators"
import { AutoComplete, DatePicker, Select, Text, TextField } from "app/components"
import { Badge, Button, Icon, List, Searchbar, Surface } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { PaymentMethod, Spend } from "app/models/realm/models"
import { useQuery } from "@realm/react"
import { SelectedReceiptList } from "./SelectedReceiptList"

// interface BuyFormScreenProps extends AppStackScreenProps<"TestScreen"> {}

export const BuyFormScreen: FC = observer(function BuyFormScreen() {
  const navigation = useNavigation<StackNavigation>()
  const {
    spendFormStore: { recipient, accountNum, setProp, errors, paymentMethod, description,paymentType },
  } = useStores()

  const [searchQuery, setSearchQuery] = React.useState("")

  // Queries
  const recipientSuggestions = useQuery(
    Spend,
    (spends) => {
      return spends.filtered(
        "recipient CONTAINS $0 AND recipient != '' AND paymentType == $1 SORT(doneAt DESC) DISTINCT(recipient) LIMIT(5)",
        recipient,
        paymentType,
      )
    },
    [recipient,paymentType],
  )
  const accountNumSuggestions = useQuery(
    Spend,
    (spends) => {
      return spends.filtered(
        "accountNum CONTAINS $0 AND accountNum != '' AND recipient CONTAINS $1 AND paymentMethod == $2 SORT(doneAt DESC) DISTINCT(accountNum) LIMIT(5)",
        accountNum,
        recipient,
        paymentMethod,
      )
    },
    [accountNum, recipient],
  )
  return (
    <View style={$root}>
      <Surface>
        <AutoComplete
          value={recipient}
          onChangeText={(value) => setProp("recipient", value)}
          error={!!errors?.recipient}
          suggestions={recipientSuggestions.map((i) => {
            return { title: i.recipient || "" }
          })}
          onSelect={(value) => {
            setProp("recipient", value)
          }}
          label="Name"
          labelTx="tankhahSpendFormScreen.recipientLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.recipientPlaceholder"
        />
        {paymentMethod !== "cash" && (
          <AutoComplete
            value={accountNum}
            onChangeText={(value) => setProp("accountNum", value)}
            suggestions={accountNumSuggestions.map((i) => {
              return { title: i.accountNum || "" }
            })}
            onSelect={(value) => {
              setProp("accountNum", value as PaymentMethod)
            }}
            label="Destination"
            labelTx="tankhahSpendFormScreen.destLabel"
            placeholder="xxxx-xxxx-xxxx-xxxx"
            placeholderTx="tankhahSpendFormScreen.destPlaceholder"
          />
        )}
        <TextField
          value={description}
          onChangeText={(value) => setProp("description", value)}
          multiline
          label="Name"
          labelTx="tankhahChargeScreen.descriptionLabel"
          placeholder="John Doe"
          placeholderTx="tankhahChargeScreen.descriptionPlaceholder"
        />
        <List.Item
          title="آیتم ها"
          right={() => (
            <Button
              mode="elevated"
              onPress={() => {
                navigation.navigate("BuyItemForm")
              }}
            >
              اضافه
            </Button>
          )}
        />
        <SelectedReceiptList
          listViewStyle={{ height: 460 }}
        />
      </Surface>
    </View>
  )
})

const $root: ViewStyle = {
  width: "100%",
  height: "100%",
}
