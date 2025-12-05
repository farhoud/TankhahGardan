import React, { FC, memo, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { TouchableOpacity, View, ViewStyle } from "react-native"
import { TextField, Text, AutoImage, CurrencyField } from "app/components"
import { IconButton, Surface, TextInput } from "react-native-paper"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import { calcTransferFee } from "app/utils/finance"
import { AppNavigation } from "app/navigators"

// interface MoneyFormScreenProps extends AppStackScreenProps<"TestScreen"> {}

export const MoneyFormScreen: FC = memo(
  observer(function MoneyFormScreen() {
    // Pull in one of our MST stores
    const {
      spendFormStore: {
        amount,
        transferFee,
        trackingNum,
        setProp,
        errors,
        attachments,
        totalItems,
        editMode,
        paymentMethod,
      },
    } = useStores()

    // Pull in navigation via hook
    const navigation = useNavigation<AppNavigation>()

    const [statusCamera, requestCamerPermission] = ImagePicker.useCameraPermissions()
    const [statusMedia, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions()
    // Checks if gif directory exists. If not, creates it
    async function saveAttachments(assets: ImagePicker.ImagePickerAsset[]) {
      const attachmentsDir = FileSystem.documentDirectory + "attachments/"
      const dirInfo = await FileSystem.getInfoAsync(attachmentsDir)
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(attachmentsDir, { intermediates: true })
      }
      for (const asset of assets) {
        const storeFile = attachmentsDir + asset.uri.split("/").pop()
        await FileSystem.copyAsync({
          from: asset.uri,
          to: attachmentsDir + asset.uri.split("/").pop(),
        })
        setProp("attachments", [...attachments, storeFile])
      }
    }

    const handlePickImage = async (source: "gallery" | "camera") => {
      // No permissions request is necessary for launching the image library
      const lunchFunc =
        source === "gallery" ? ImagePicker.launchImageLibraryAsync : ImagePicker.launchCameraAsync
      const result = await lunchFunc({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      })
      result.assets && (await saveAttachments(result.assets))
    }

    const handleRemoveAttachment = async (item: string) => {
      await FileSystem.deleteAsync(item)
      setProp(
        "attachments",
        attachments.filter((i) => {
          return i === item
        }),
      )
    }

    useEffect(() => {
      if (!editMode) setProp("amount", totalItems)
    }, [totalItems])

    useEffect(() => {
      setProp("transferFee", calcTransferFee(amount, paymentMethod))
    }, [amount, paymentMethod])

    return (
      <Surface style={$root}>
        <CurrencyField
          value={amount}
          onChangeValue={(value) => value && setProp("amount", value)}
          error={!!errors?.amount}
          label="Amount"
          labelTx="tankhahChargeScreen.amountLabel"
          placeholder="John Doe"
          placeholderTx="tankhahChargeScreen.amountPlaceholder"
        />
        {["ctc", "paya", "satna", "other", "pol-d", "pol-r", "pol-c"].includes(paymentMethod) && <CurrencyField
          value={transferFee}
          onChangeValue={(value) => value && setProp("transferFee", value)}
          error={!!errors?.transferFee}
          label="Name"
          labelTx="tankhahSpendFormScreen.feesLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.feesPlaceholder"
        />}
        <TextField
          value={trackingNum}
          onChangeText={(value) => setProp("trackingNum", value)}
          label="Name"
          labelTx="tankhahSpendFormScreen.trackingNumLabel"
          placeholder="John Doe"
          placeholderTx="tankhahSpendFormScreen.trackingNumPlaceholder"
        />
        <View style={{ margin: 20 }}>
          <Text variant="labelMedium">پیوست ها</Text>
          <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
            {!attachments && <Text>ندارد</Text>}
            {attachments.map((i, index) => {
              return (
                <TouchableOpacity key={i} onPress={() => {
                  attachments && navigation.navigate("ImageView", { images: attachments, index })
                }} onLongPress={() => handleRemoveAttachment(i)}>
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
            <IconButton onPress={() => handlePickImage("camera")} icon="camera-plus" />
            <IconButton onPress={() => handlePickImage("gallery")} icon="folder-open" />
          </View>
        </View>
      </Surface>
    )
  }),
)

const $root: ViewStyle = {
  width: "100%",
  height: "100%",
}
