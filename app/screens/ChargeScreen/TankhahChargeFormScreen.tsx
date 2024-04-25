import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useLayoutEffect, useState } from "react"
import { ViewStyle } from "react-native"
import { Screen, TextField, Header } from "../../components"
import { DatePicker } from "app/components/DatePicker"
import { isNumber } from "app/utils/validation"
import { useObject, useRealm } from "@realm/react"
import { Fund } from "app/models/realm/models"
import { currencyFormatter } from "app/utils/formatDate"
import { StackNavigation } from "app/navigators"
import { CommonActions, useNavigation } from "@react-navigation/native"
import { BSON, UpdateMode } from "realm"
import { ChargeStackScreenProps } from "app/navigators/ChargeNavigator"

export const TankhahChargeFromScreen: FC<ChargeStackScreenProps<"ChargeForm">> = observer(
  function TankhahChargeScreen(_props) {
    const itemId = _props.route.params?.itemId
    const navigation = useNavigation<StackNavigation>()
    const [amount, setAmount] = useState(0)
    const [description, setDescription] = useState("")
    const [doneAt, setDoneAt] = useState(new Date())
    const [isValid, setIsValid] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>()
    const realm = useRealm()
    const data = useObject(Fund, new BSON.ObjectID(itemId))

    const validateForm = () => {
      let errors: Record<string, string> = {}
      console.log(amount)
      if (!amount || !isNumber(Number(amount))) {
        errors.amount = "لطفا مقدار را درست وارد کنید."
      }
      if (!doneAt) {
        errors.doneAt = "فیلد تاریخ الزامیست"
      }
      setErrors(errors)
      setIsValid(Object.keys(errors).length === 0)
    }

    const handleSubmit = () => {
      if (isValid) {
        realm.write(() => {
          const res = realm.create(
            "Fund",
            {
              _id: data ? data._id : new BSON.ObjectID(),
              doneAt,
              amount,
              description,
            },
            data ? UpdateMode.Modified : undefined,
          )
          console.log(res)
        })
        goBack()
      }
    }

    const goBack = () => {
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Demo", params: { screen: "ChargeList", params: {} } }],
          }),
        )
      }
    }

    useEffect(() => {
      if (data) {
        setAmount(data.amount)
        setDoneAt(data.doneAt)
        setDescription(data.description || "")
      }
    }, [data])

    useEffect(() => {
      // Trigger form validation when name,
      // email, or password changes
      validateForm()
    }, [amount, doneAt])

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Header
            title="شارژ"
            leftIcon="back"
            onLeftPress={() => goBack()}
            rightTx="common.save"
            onRightPress={isValid ? handleSubmit : undefined}
          />
        ),
      })
    }, [isValid, handleSubmit])

    return (
      <Screen
        preset="fixed"
        // safeAreaEdges={["top"]}
        contentContainerStyle={$screenContentContainer}
      >
        <TextField
          value={amount.toString()}
          onChangeText={(value) => {
            setAmount(Number(value) || 0)
          }}
          keyboardType="numeric"
          status={errors?.amount ? "error" : undefined}
          label="Name"
          helper={errors?.amount ? errors?.amount : currencyFormatter.format(Number(amount))}
          labelTx="tankhahChargeScreen.amountLabel"
          placeholder="John Doe"
          placeholderTx="tankhahChargeScreen.amountPlaceholder"
        />

        <DatePicker
          date={doneAt}
          onDateChange={(date) => setDoneAt(date)}
          // status="error"
          status={errors?.doneAt ? "error" : undefined}
          label="Name"
          labelTx="tankhahChargeScreen.dateLabel"
          placeholderTx="tankhahChargeScreen.datePlaceholder"
        />

        <TextField
          value={description}
          onChangeText={(value) => setDescription(value)}
          multiline
          status={errors?.description ? "error" : undefined}
          label="Name"
          labelTx="tankhahChargeScreen.descriptionLabel"
          placeholder="John Doe"
          placeholderTx="tankhahChargeScreen.descriptionPlaceholder"
        />
      </Screen>
    )
  },
)

// #region Styles
const $screenContentContainer: ViewStyle = {
  flex: 1,
  // marginTop: 100,
  marginHorizontal: 10,
}
