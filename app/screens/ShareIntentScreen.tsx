import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { ListView, Screen, Text } from "app/components"
import { useShareIntentContext } from "expo-share-intent"
import { Button, Card, IconButton, List } from "react-native-paper"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"

interface ShareIntentScreenProps extends AppStackScreenProps<"ShareIntent"> { }

export const ShareIntentScreen: FC<ShareIntentScreenProps> = observer(function ShareIntentScreen() {
  // Pull in one of our MST stores
  const { shareIntent: { list, addNewShareIntent, parseText } } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()

  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext()

  useEffect(() => {
    hasShareIntent && shareIntent.text && addNewShareIntent(shareIntent.text)
    resetShareIntent()
  }, [hasShareIntent])

  return (
    <Screen style={$root} preset="fixed">
      <ListView renderItem={({ item }) => {
        return (
          <Card style={{ margin: 5 }}>
            <Card.Content>
              <Text>{item.text}</Text>
              {item.error && <Text style={{ padding: 5, color: "red" }} variant="bodySmall">{item.error}</Text>}
            </Card.Content>
            <Card.Actions>
              <Button disabled={item.loading} loading={item.loading} onPress={() => parseText(item.id)}>هضم</Button>
            </Card.Actions>
          </Card>
        )
      }} data={list.slice()}>
      </ListView>
    </Screen>
  )

})

const $root: ViewStyle = {
  flex: 1,
}
