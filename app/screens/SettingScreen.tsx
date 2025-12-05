import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, TextStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text, TextField } from "app/components"
import { useStores } from "app/models"

interface SettingScreenProps extends AppStackScreenProps<"Setting"> {}

export const SettingScreen: FC<SettingScreenProps> = observer(function SettingScreen() {
  const { openRouter } = useStores()

  return (
    <Screen safeAreaEdges={["top"]} style={$root} preset="scroll">
      <Text variant="headlineSmall" style={$title}>
        تنظیمات OpenRouter
      </Text>
      <TextField
        label="API Key"
        value={openRouter.apiKey}
        onChangeText={(text) => openRouter.setProp("apiKey", text)}
        placeholder="Enter your OpenRouter API key"
        secureTextEntry
      />
      <TextField
        label="Model"
        value={openRouter.model}
        onChangeText={(text) => openRouter.setProp("model", text)}
        placeholder="e.g., gpt-3.5-turbo"
      />
      <Button
        onPress={() => {
          // Save settings - they are automatically saved via MST
          console.log("Settings saved:", { apiKey: openRouter.apiKey, model: openRouter.model })
        }}
        style={$saveButton}
      >
        ذخیره تنظیمات
      </Button>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  padding: 16,
}

const $title: TextStyle = {
  marginBottom: 24,
  textAlign: "center",
}

const $saveButton: ViewStyle = {
  marginTop: 24,
}
