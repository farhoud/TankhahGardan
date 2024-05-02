import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { TextField } from "app/components"
import { Surface, TextInput } from "react-native-paper"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { currencyFormatter } from "app/utils/formatDate"

interface MoneyFormScreenProps extends AppStackScreenProps<"TestScreen"> {}

export const MoneyFormScreen: FC<MoneyFormScreenProps> = observer(function MoneyFormScreen() {
  // Pull in one of our MST stores
  const {
    spendFormStore: { amount, transferFee, trackingNum, setProp, errors },
  } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <View style={$root}>
      <Surface>
        <TextField
          right={<TextInput.Affix text="ریال" />}
          value={amount.toString()}
          onChangeText={(value) => setProp("amount", Number(value))}
          error={!!errors?.amount}
          keyboardType="numeric"
          label="Amount"
          labelTx="tankhahChargeScreen.amountLabel"
          placeholder="John Doe"
          placeholderTx="tankhahChargeScreen.amountPlaceholder"
          helper={currencyFormatter.format(amount)}
        ></TextField>
        <TextField
          value={transferFee.toString()}
          onChangeText={(value) => setProp("transferFee", Number(value))}
          error={!!errors?.transferFee}
          keyboardType="numeric"
          label="Name"
          labelTx="tankhahSpendFormScreen.feesLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.feesPlaceholder"
          helper={currencyFormatter.format(transferFee)}
        />
        <TextField
          value={trackingNum}
          onChangeText={(value) => setProp("trackingNum", value)}
          label="Name"
          labelTx="tankhahSpendFormScreen.trackingNumLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.trackingNumPlaceholder"
        />
      </Surface>
    </View>
  )
})

const $root: ViewStyle = {
  width: "100%",
  height: "100%",
}
