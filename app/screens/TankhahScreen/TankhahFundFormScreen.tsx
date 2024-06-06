import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useLayoutEffect, useRef, useState } from "react"
import { TextInput, ViewStyle } from "react-native"
import { CurrencyField, Screen, TextField } from "../../components"
import { DatePicker } from "app/components/DatePicker/DatePicker"
import { isNumber } from "app/utils/validation"
import { useObject, useRealm } from "@realm/react"
import { TankhahItem } from "app/models/realm/models"
import { AppStackScreenProps, AppNavigation } from "app/navigators"
import { CommonActions, useNavigation } from "@react-navigation/native"
import { BSON, UpdateMode } from "realm"
import { Appbar, Button } from "react-native-paper"

export const TankhahChargeFromScreen: FC<AppStackScreenProps<"TankhahFundForm">> = observer(
  function TankhahChargeScreen(_props) {
    const itemId = _props.route.params?.itemId

    const navigation = useNavigation<AppNavigation>()
    const realm = useRealm()

    const refAmount = useRef<TextInput>(null)
    const refDescription = useRef<TextInput>(null)

    const [amount, setAmount] = useState(0)
    const [description, setDescription] = useState("")
    const [doneAt, setDoneAt] = useState(new Date())
    const [isValid, setIsValid] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>()

    const data = useObject(TankhahItem, new BSON.ObjectID(itemId))


    const validateForm = () => {
      let errors: Record<string, string> = {}
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
        const res = realm.write(() => {
          return realm.create(
            TankhahItem,
            {
              _id: data ? data._id : new BSON.ObjectID(),
              doneAt,
              amount,
              total: amount,
              opType: "fund",
              paymentMethod: "cash",
              description,
            },
            data ? UpdateMode.Modified : undefined,
          )
        })
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: "AppTabs",
                params: { screen: "TankhahHome", params: { itemId: res._id.toHexString() } },
              },
            ],
          }),
        )
      }
    }

    const goBack = () => {
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "AppTabs", params: { screen: "TankhahHome", params: {} } }],
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

        <CurrencyField
          ref={refAmount}
          value={amount}
          autoFocus
          onSubmitEditing={() => {
            refDescription && refDescription.current?.focus()
          }}
          keyboardType="numeric"
          error={!!amount && !!errors?.amount}
          label="Name"
          labelTx="tankhahChargeScreen.amountLabel"
          // placeholder="John Doe"
          placeholderTx="tankhahChargeScreen.amountPlaceholder"
          onChangeValue={(value) => setAmount(value)}
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
