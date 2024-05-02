import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { TextInput, ViewStyle } from "react-native"
import { Screen, TextField, Header, Text } from "../../components"
import { DatePicker } from "app/components/DatePicker"
import { isNumber } from "app/utils/validation"
import { useObject, useRealm } from "@realm/react"
import { Fund } from "app/models/realm/models"
import { currencyFormatter, tomanFormatter } from "app/utils/formatDate"
import { AppStackScreenProps, StackNavigation } from "app/navigators"
import { CommonActions, useNavigation } from "@react-navigation/native"
import { BSON, UpdateMode } from "realm"
import { ChargeStackScreenProps } from "app/navigators/ChargeNavigator"
import { Appbar, Button, Icon } from "react-native-paper"
import MaskInput, { createNumberMask } from "react-native-mask-input"

export const TankhahChargeFromScreen: FC<AppStackScreenProps<"ChargeForm">> = observer(
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

    const refAmount = useRef<TextInput>(null)
    const refDescription = useRef<TextInput>(null)

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

    const amountHelper = useMemo(() => {
      if (!amount) {
        return "فیلد الزامیست"
      }
      return errors?.amount ? errors?.amount : tomanFormatter(Number(amount))
    }, [amount, errors?.amount])

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
            routes: [{ name: "TankhahTabs", params: { screen: "ChargeList", params: {} } }],
          }),
        )
      }
    }

    const dollarMask = createNumberMask({
      prefix: ["﷼", " "],
      delimiter: "٫",
      separator: ".",
      precision: 0,
    })

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
          <Appbar.Header>
            <Appbar.BackAction onPress={goBack}></Appbar.BackAction>
            <Appbar.Content title={false} />
            <Appbar.Content title={false} />
            <Appbar.Content title={false} />
            <Appbar.Content
              title={
                <Button
                  disabled={!isValid}
                  style={{}}
                  onPress={isValid ? handleSubmit : undefined}
                  mode="contained"
                  compact
                >
                  ثبت
                </Button>
              }
            />
          </Appbar.Header>
        ),
      })
    }, [isValid, handleSubmit])

    return (
      <Screen
        preset="fixed"
        // safeAreaEdges={["top"]}
        contentContainerStyle={$screenContentContainer}
      >
        <DatePicker
          date={doneAt}
          onDateChange={(date) => setDoneAt(date)}
          onDone={() => {
            refAmount && refAmount.current?.focus()
          }}
          error={!!errors?.doneAt}
          labelTx="tankhahChargeScreen.dateLabel"
          placeholderTx="tankhahChargeScreen.datePlaceholder"
        />

        <TextField
          ref={refAmount}
          value={amount ? amount.toString() : ""}
          autoFocus
          onSubmitEditing={() => {
            refDescription && refDescription.current?.focus()
          }}
          keyboardType="numeric"
          error={!!amount && !!errors?.amount}
          label="Name"
          helper={amountHelper}
          labelTx="tankhahChargeScreen.amountLabel"
          // placeholder="John Doe"
          placeholderTx="tankhahChargeScreen.amountPlaceholder"
          render={(props) => <MaskInput {...props} mask={dollarMask} onChangeText={(masked, unmasked)=>{
            setAmount(Number(unmasked) || 0)
          }} />}
        />

        <TextField
          ref={refDescription}
          value={description}
          onChangeText={(value) => setDescription(value)}
          multiline
          error={!!errors?.description}
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
  paddingHorizontal: 10,
  display: "flex",
  flexDirection: "column",
}
