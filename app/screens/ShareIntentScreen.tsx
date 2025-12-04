import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen } from "app/components"
import { useShareIntentContext } from "expo-share-intent"
import { ActivityIndicator } from "react-native-paper"
import { useStores } from "app/models"

interface ShareIntentScreenProps extends AppStackScreenProps<"ShareIntent"> {}

export const ShareIntentScreen: FC<ShareIntentScreenProps> = observer(function ShareIntentScreen() {
  // Pull in one of our MST stores
  const {
    shareIntent: { addNewShareIntent },
  } = useStores()
  // Pull in navigation via hook

  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext()

  useEffect(() => {
    if (hasShareIntent) {
      shareIntent.text && addNewShareIntent(shareIntent.text)
      resetShareIntent()
    }
  }, [hasShareIntent])

  return (
    <Screen style={$root} preset="fixed">
      <ActivityIndicator animating={true} />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
