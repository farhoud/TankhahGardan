import React, { FC, memo, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AutoComplete, DatePicker, Select, TextField } from "app/components"
import { Surface } from "react-native-paper"
import { useStores } from "app/models"
import { PaymentMethod, OperationType, TankhahItem } from "app/models/realm/tankhah"
import { useQuery } from "@realm/react"

export const BasicFormScreen: FC = memo(
  observer(function BasicFormScreen() {
    const [focused, setFocused] = React.useState<"recipient" | "accountNum">()
    // variables

    // Pull in one of our MST stores
    const {
      spendFormStore: {
        doneAt,
        opType,
        paymentMethod,
        group,
        setProp,
        errors,
        recipient,
        accountNum,
        description,
      },
    } = useStores()

    const groupSuggestions = useQuery({
      type:TankhahItem,
      query: (spends) => 
        spends.filtered(
          "group.name CONTAINS $0 SORT(doneAt DESC) DISTINCT(group.name)",
          group,
        )
      },
      [group]
    )

    const recipientSuggestions = useQuery({
      type:TankhahItem,
      query: (spends) => {
        return spends.filtered(
          "recipient CONTAINS $0 AND recipient != '' AND opType == $1 SORT(doneAt DESC) DISTINCT(recipient)",
          recipient,
          opType,
        )
      }},
      [recipient, opType],
    )
    const accountNumSuggestions = useQuery({
      type:TankhahItem,
      query: (spends) => {
        return spends.filtered(
          "accountNum CONTAINS $0 AND accountNum != '' AND recipient CONTAINS $1 AND paymentMethod == $2 SORT(doneAt DESC) DISTINCT(accountNum)",
          accountNum,
          recipient,
          paymentMethod,
        )
      }},
      [accountNum, recipient, paymentMethod],
    )

    useEffect(() => {
      if (focused === "recipient" && !accountNum) {
        setProp("accountNum", accountNumSuggestions.at(0)?.accountNum || undefined)
      }
    }, [accountNumSuggestions, focused])

    // Pull in navigation via hook
    // const navigation = useNavigation()
    return (
      <Surface style={$root}>
        <DatePicker
          date={doneAt}
          onDateChange={(date) => {
            if (date) {
              setProp("doneAt", date)
            }
          }}
          error={!!errors?.doneAt}
          label="Name"
          labelTx="tankhahChargeScreen.dateLabel"
          placeholderTx="tankhahChargeScreen.datePlaceholder"
        />
        <AutoComplete
          value={group}
          onChangeText={(value) => setProp("group", value)}
          error={!!errors?.group}
          suggestions={groupSuggestions.map((i) => {
            return { title: i.group?.name || "" }
          })}
          onSelect={(value) => {
            setProp("group", value)
          }}
          label="Name"
          labelTx="tankhahSpendFormScreen.groupLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.groupPlaceholder"
        />
        <Select
          options={[
            { value: "buy", label: "خرید" },
            { value: "transfer", label: "واریز" },
          ]}
          label="نوع عملیات"
          value={opType}
          onSelect={(value) => {
            setProp("opType", value as OperationType)
          }}
          error={!!errors?.opType}
        />
        <Select
          options={[
            { value: "satna", label: "ساتنا" },
            { value: "paya", label: "پایا" },
            { value: "ctc", label: "کارت به کارت" },
            { value: "cash", label: "نقد" },
            { value: "pos", label: "پوز" },
            { value: "sts", label: "سپرده به سپرده" },
            { value: "pol-r", label: "پل آنی" },
            { value: "pol-c", label: "پل چرخه" },
            { value: "pol-d", label: "پل روزانه" },
            { value: "other", label: "دیگر" },
          ]}
          label="روش پرداخت"
          value={paymentMethod}
          onSelect={(value) => {
            setProp("paymentMethod", value as PaymentMethod)
          }}
          error={!!errors?.paymentMethod}
        />

        {!["pos", "cash"].includes(paymentMethod) && (
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
            onFocus={() => {
              setFocused("recipient")
            }}
            label="Name"
            labelTx="tankhahSpendFormScreen.recipientLabel"
            placeholder="John Doe"
            placeholderTx="tankhahSpendFormScreen.recipientPlaceholder"
          />
        )}

        <AutoComplete
          value={accountNum}
          onChangeText={(value) => setProp("accountNum", value)}
          suggestions={accountNumSuggestions.map((i) => {
            return { title: i.accountNum || "" }
          })}
          type={paymentMethod}
          onFocus={() => {
            setFocused("accountNum")
          }}
          onSelect={(value) => {
            setProp("accountNum", value as PaymentMethod)
          }}
          label="Destination"
          labelTx="tankhahSpendFormScreen.destLabel"
          placeholder="xxxx-xxxx-xxxx-xxxx"
          placeholderTx="tankhahSpendFormScreen.destPlaceholder"
        />

        <TextField
          value={description}
          onChangeText={(value) => setProp("description", value)}
          multiline
          label="Name"
          labelTx="tankhahChargeScreen.descriptionLabel"
          placeholder="John Doe"
          placeholderTx="tankhahChargeScreen.descriptionPlaceholder"
        />
      </Surface>
    )
  }),
)

const $root: ViewStyle = {
  width: "100%",
  height: "100%",
}
