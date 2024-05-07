import React, { FC, memo, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { TouchableOpacity, View, ViewStyle } from "react-native"
import { TextField, Text, AutoImage, CurrencyField } from "app/components"
import { IconButton, Surface, TextInput } from "react-native-paper"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"

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
      },
    } = useStores()

    // Pull in navigation via hook
    // const navigation = useNavigation()

    const [statusCamera, requestCamerPermission] = ImagePicker.useCameraPermissions()
    const [statusMedia, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions()
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
        setProp("attachments", [...attachments, storeFile])
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
      setProp(
        "attachments",
        attachments.filter((i) => {
          return i === item
        }),
      )
      console.log(attachments)
    }

    useEffect(() => {
      if (!editMode) setProp("amount", totalItems)
    }, [totalItems])

    return (
      <View style={$root}>
        <Surface>
          <CurrencyField
            value={amount}
            onChangeValue={(value) => setProp("amount", value)}
            error={!!errors?.amount}
            label="Amount"
            labelTx="tankhahChargeScreen.amountLabel"
            placeholder="John Doe"
            placeholderTx="tankhahChargeScreen.amountPlaceholder"
          />
          <CurrencyField
            value={transferFee}
            onChangeValue={(value) => setProp("transferFee", value)}
            error={!!errors?.transferFee}
            label="Name"
            labelTx="tankhahSpendFormScreen.feesLabel"
            placeholder="John Doe"
            placeholderTx="tankhahSpendFormScreen.feesPlaceholder"
          />
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
              {attachments.map((i) => {
                return (
                  <TouchableOpacity key={i} onLongPress={() => handleRemoveAttachment(i)}>
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
      </View>
    )
  }),
)

const $root: ViewStyle = {
  width: "100%",
  height: "100%",
}
