import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useLayoutEffect, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { AutoImage, Button, Header, Icon, Screen, Text } from "../../components"
import { colors } from "../../theme"
import { TextField } from "../../components"
import { AutoComplete } from "app/components/AutoComplete"
import { ButtonSelect } from "app/components/ButtonSelect"
import { DatePicker } from "app/components/DatePicker"
import * as ImagePicker from "expo-image-picker"
import { TouchableOpacity } from "react-native-gesture-handler"
import * as FileSystem from "expo-file-system"
import { useObject, useQuery, useRealm } from "@realm/react"
import { PaymentMethod, Spend } from "app/models/realm/models"
import { calcTransferFee } from "app/utils/finance"
import { currencyFormatter } from "app/utils/formatDate"
import { isNumber } from "app/utils/validation"
import { BSON, UpdateMode } from "realm"
import ImageView from "react-native-image-viewing"
import { AppStackScreenProps, StackNavigation } from "app/navigators"
import { useNavigation } from "@react-navigation/native"
import { SpendStackScreenProps } from "app/navigators/SpendNavigator"

export const TankhahSpendFormScreen: FC<SpendStackScreenProps<"TankhahSpendForm">> = observer(
  function TankhahSpendFormScreen(_props) {
    // Props
    const itemId = _props.route.params?.itemId
    // navagatoin
    const navigation = useNavigation<StackNavigation>()
    // Form field States
    const [doneAt, setDoneAt] = useState(new Date())
    const [recipient, setRecipient] = useState("")
    const [accountNum, setAccountNum] = useState<string>("")
    const [transferFee, setTransferFee] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
    const [amount, setAmount] = useState(0)
    const [trackingNum, setTrackingNum] = useState("")
    const [group, setGroup] = useState("")
    const [description, setDescription] = useState("")
    const [attachments, setAttachments] = useState<string[]>([])
    const [isValid, setIsValid] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>()
    // Image viewer
    const [viewerIsVisible, setViewerIsVisible] = useState(false)
    // Permissions
    const [statusCamera, requestCamerPermission] = ImagePicker.useCameraPermissions()
    const [statusMedia, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions()
    // Realm
    const realm = useRealm()
    // Realm Object
    const data = useObject(Spend, new BSON.ObjectID(itemId))

    // Queries
    const recipientSuggestions = useQuery(
      Spend,
      (spends) => {
        return spends.filtered(
          "recipient CONTAINS $0 AND recipient != '' SORT(doneAt DESC) DISTINCT(recipient) LIMIT(5)",
          recipient,
        )
      },
      [recipient],
    )
    const accountNumSuggestions = useQuery(
      Spend,
      (spends) => {
        return spends.filtered(
          "accountNum CONTAINS $0 AND accountNum != '' AND recipient CONTAINS $1 SORT(doneAt DESC) DISTINCT(accountNum) LIMIT(5)",
          accountNum,
          recipient,
        )
      },
      [accountNum, recipient],
    )

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

    // -
    // Form validation
    const validateForm = () => {
      let errors: Record<string, string> = {}
      const required = "این فیلد الزامیست"
      if (!doneAt) {
        errors.doneAt = required
      }
      if (!recipient) {
        errors.recipient = required
      }
      if (!amount) {
        errors.amount = required
      }
      if (!isNumber(transferFee)) {
        errors.transferFee = required
      }
      if (!paymentMethod) {
        errors.paymentMethod = required
      }
      if (!group) {
        errors.group = required
      }
      console.log(errors)
      setErrors(errors)
      setIsValid(Object.keys(errors).length === 0)
    }

    // Checks if gif directory exists. If not, creates it
    async function saveAttachments(assets: ImagePicker.ImagePickerAsset[]) {
      const attachmentsDir = FileSystem.documentDirectory + "attachments/"
      const dirInfo = await FileSystem.getInfoAsync(attachmentsDir)
      if (!dirInfo.exists) {
        console.log("Gif directory doesn't exist, creating…")
        await FileSystem.makeDirectoryAsync(attachmentsDir, { intermediates: true })
      }
      for (const asset of assets) {
        console.log("saving image: ", asset)
        const storeFile = attachmentsDir + asset.uri.split("/").pop()
        await FileSystem.copyAsync({
          from: asset.uri,
          to: attachmentsDir + asset.uri.split("/").pop(),
        })
        console.log(`${storeFile} saved`)
        setAttachments((state) => [...state, storeFile])
      }
    }

    const handlePickImage = async (source: "gallery" | "camera") => {
      // No permissions request is necessary for launching the image library
      const lunchFunc =
        source === "gallery" ? ImagePicker.launchImageLibraryAsync : ImagePicker.launchCameraAsync
      let result = await lunchFunc({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })
      result.assets && (await saveAttachments(result.assets))
    }

    const handleRemoveAttachment = async (item: string) => {
      await FileSystem.deleteAsync(item)
      setAttachments((prev) =>
        prev.filter((i) => {
          i === item
          console.log("filter function", i, item)
        }),
      )
      console.log(attachments)
    }
    const handleSubmit = () => {
      console.log(doneAt)
      if (isValid) {
        realm.write(() => {
          const res = realm.create(
            "Spend",
            {
              _id: data ? data._id : new BSON.ObjectID(),
              doneAt,
              paymentMethod,
              amount,
              transferFee,
              total: amount + transferFee,
              recipient,
              accountNum,
              group,
              description,
              attachments,
              trackingNum,
            },
            data ? UpdateMode.Modified : undefined,
          )
          
        })
        navigation.goBack()
        return
      }
    }

    useEffect(() => {
      validateForm()
    }, [doneAt, recipient, amount, transferFee, group, paymentMethod])

    useEffect(() => {
      setTransferFee(calcTransferFee(amount, paymentMethod))
    }, [paymentMethod, amount])

    useEffect(() => {
      if (data) {
        console.log("form date: ", data.doneAt)
        setRecipient(data.recipient)
        setAccountNum(data.accountNum || "")
        setDoneAt(data.doneAt)
        setTransferFee(data.transferFee)
        setPaymentMethod(data.paymentMethod)
        setAmount(data.amount)
        setTrackingNum(data.trackingNum || "")
        setGroup(data.group)
        setDescription(data.description || "")
        setAttachments(data.attachments || [])
      }
    }, [data])

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Header
            title="خرج"
            leftIcon="back"
            onLeftPress={() => navigation.goBack()}
            rightTx="common.save"
            onRightPress={isValid?handleSubmit:undefined}
          />
        ),
      })
    }, [isValid,handleSubmit])
    
    return (
      <Screen
        preset="scroll"
        safeAreaEdges={["bottom"]}
        contentContainerStyle={$screenContentContainer}
      >
        <DatePicker
          date={doneAt}
          onDateChange={(date) =>{ console.log(date), setDoneAt(date) }}
          status={errors?.doneAt ? "error" : undefined}
          label="Name"
          labelTx="tankhahChargeScreen.dateLabel"
          placeholderTx="tankhahChargeScreen.datePlaceholder"
        />

        <AutoComplete
          value={recipient}
          onChangeText={(value) => setRecipient(value)}
          status={errors?.recipient ? "error" : undefined}
          suggestions={recipientSuggestions.map((i) => {
            return { title: i.recipient || "" }
          })}
          // status="error"
          onSelect={(text) => {
            setRecipient(text)
          }}
          label="Name"
          labelTx="tankhahSpendFormScreen.nameLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.namePlaceholder"
        />
        {/* </View> */}
        <ButtonSelect
          value={paymentMethod}
          items={[
            { key: "satna", title: "ساتنا" },
            { key: "paya", title: "پایا" },
            { key: "ctc", title: "کارت به کارت" },
            { key: "cash", title: "نقد" },
            { key: "other", title: "دیگر" },
          ]}
          onChangeValue={(evt) => {
            setPaymentMethod(evt.key as PaymentMethod)
          }}
        ></ButtonSelect>
        {paymentMethod !== "cash" && (
          // <View style={{ zIndex: 100 }}>
          <AutoComplete
            value={accountNum}
            onChangeText={(value) => setAccountNum(value)}
            // status="error"
            suggestions={accountNumSuggestions.map((i) => {
              return { title: i.accountNum || "" }
            })}
            // status="error"
            onSelect={(value) => {
              setAccountNum(value as PaymentMethod)
            }}
            // status="error"
            label="Destination"
            labelTx="tankhahSpendFormScreen.destLabel"
            placeholder="xxxx-xxxx-xxxx-xxxx"
            placeholderTx="tankhahSpendFormScreen.destPlaceholder"
          />
          // </View>
        )}
        <TextField
          value={amount.toString()}
          onChangeText={(value) => setAmount(Number(value))}
          status={errors?.amount ? "error" : undefined}
          keyboardType="numeric"
          label="Amount"
          labelTx="tankhahChargeScreen.amountLabel"
          placeholder="John Doe"
          placeholderTx="tankhahChargeScreen.amountPlaceholder"
          helper={currencyFormatter.format(amount)}
        ></TextField>
        <TextField
          value={transferFee.toString()}
          onChangeText={(value) => setTransferFee(Number(value))}
          status={errors?.transferFee ? "error" : undefined}
          keyboardType="numeric"
          label="Name"
          labelTx="tankhahSpendFormScreen.feesLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.feesPlaceholder"
          helper={currencyFormatter.format(transferFee)}
        />
        <TextField
          value={trackingNum}
          onChangeText={(value) => setTrackingNum(value)}
          label="Name"
          labelTx="tankhahSpendFormScreen.trackingNumLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.trackingNumPlaceholder"
        />
        <AutoComplete
          value={group}
          onChangeText={(value) => setGroup(value)}
          status={errors?.group ? "error" : undefined}
          suggestions={groupSuggestions.map((i) => {
            return { title: i.group || "" }
          })}
          onSelect={(value) => {
            setGroup(value as PaymentMethod)
          }}
          label="Name"
          labelTx="tankhahSpendFormScreen.groupLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.groupPlaceholder"
        />
        <TextField
          value={description}
          onChangeText={(value) => setDescription(value)}
          multiline
          // status="error"
          label="Name"
          labelTx="tankhahChargeScreen.descriptionLabel"
          placeholder="John Doe"
          placeholderTx="tankhahChargeScreen.descriptionPlaceholder"
        />
        <View style={{ margin: 20 }}>
          <Text preset="formLabel">پیوست ها</Text>
          <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
            {!attachments && <Text>ندارد</Text>}
            {attachments && (
              <ImageView
                images={attachments.map((i) => {
                  return { uri: i }
                })}
                imageIndex={0}
                visible={viewerIsVisible}
                onRequestClose={() => setViewerIsVisible(false)}
              />
            )}
            {attachments.map((i) => {
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setViewerIsVisible(true)
                  }}
                  onLongPress={() => handleRemoveAttachment(i)}
                >
                  <AutoImage
                    style={{ margin: 5 }}
                    source={{ uri: i }}
                    maxHeight={70}
                    maxWidth={60}
                  ></AutoImage>
                </TouchableOpacity>
              )
            })}
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <TouchableOpacity style={$iconBtn} onPress={() => handlePickImage("camera")}>
              <Icon size={30} icon={"addPhotoCamera"}></Icon>
            </TouchableOpacity>
            <TouchableOpacity style={$iconBtn} onPress={() => handlePickImage("gallery")}>
              <Icon size={30} icon={"addPhotoGallery"}></Icon>
            </TouchableOpacity>
          </View>
        </View>

      </Screen>
    )
  },
)

// #region Styles
const $screenContentContainer: ViewStyle = {
  // flex: 1,
  marginHorizontal: 10
  // margin: 10,
  // marginTop: 20,
  // backgroundColor: "gray",
  // padding: 20,

}

const $iconBtn: ViewStyle | TextStyle = {
  borderRadius: 180,
  padding: 10,
  margin: 2,
  backgroundColor: colors.palette.neutral100,
  borderColor: colors.border,
  borderStyle: "solid",
  borderWidth: 2,
}

// #endregion
