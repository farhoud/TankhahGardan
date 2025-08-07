import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ListRenderItemInfo, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { ListView, Screen, Text } from "app/components"
import { useShareIntentContext } from "expo-share-intent"
import { Button, Card, IconButton, List } from "react-native-paper"
// import { useNavigation } from "@react-navigation/native"
import { ShareIntentItem, useStores } from "app/models"

interface ShareIntentScreenProps extends AppStackScreenProps<"ShareIntent"> {}

export const ShareIntentScreen: FC<ShareIntentScreenProps> = observer(function ShareIntentScreen() {
  // Pull in one of our MST stores
  const {
    shareIntent: { list, addNewShareIntent, parseText, deleteListItem },
  } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()

  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext()

  useEffect(() => {
    hasShareIntent && shareIntent.text && addNewShareIntent(shareIntent.text)
    resetShareIntent()
  }, [hasShareIntent])

  return (
    <Screen style={$root} preset="fixed">
      <ListView
        data={list.slice()}
        renderItem={({ item }) => (
          <ListItem key={item.id} item={item} onRun={parseText} onDelete={deleteListItem} />
        )}
      />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

export const ListItem = observer(
  (props: {
    item: ShareIntentItem
    onRun: (id: string) => void
    onDelete?: (id: string) => void
  }) => {
    const {
      item: { id, text, loading, error },
      onRun,
      onDelete,
    } = props
    return (
      <Card style={{ margin: 5 }}>
        <Card.Content>
          <Text>{text}</Text>
          {error && (
            <Text style={{ padding: 5, color: "red" }} variant="bodySmall">
              {error}
            </Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button disabled={loading} loading={loading} onPress={() => onRun(id)}>
            هضم
          </Button>
          {onDelete && (
            <Button disabled={loading} onPress={() => onDelete(id)}>
              حذف
            </Button>
          )}
        </Card.Actions>
      </Card>
    )
  },
)
