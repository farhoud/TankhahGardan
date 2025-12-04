import React, { FC, useLayoutEffect } from "react"
import { observer } from "mobx-react-lite"
import { getSnapshot } from "mobx-state-tree"
import { ViewStyle } from "react-native"
import { AppNavigation, AppStackScreenProps } from "app/navigators"
import { ListView, Screen, Text } from "app/components"
import { Appbar, Button, Card } from "react-native-paper"
import { CommonActions, useNavigation } from "@react-navigation/native"
import { ShareIntentItem, useStores } from "app/models"
import * as Clipboard from "expo-clipboard"

interface SpendImportScreenProps extends AppStackScreenProps<"SpendImport"> { }

export const SpendImportScreen: FC<SpendImportScreenProps> = observer(function SpendImportScreen() {
  // Pull in one of our MST stores
  const {
    shareIntent: { list, addNewShareIntent, parseText, deleteListItem },
    openRouter: { apiKey, model },
    setSpendForm,
  } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation<AppNavigation>()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
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
            }}
          />
          <Appbar.Content title={""} />
          <Appbar.Action
            icon="clipboard"
            onPress={async () => {
              try {
                const text = await Clipboard.getStringAsync()
                if (text) {
                  addNewShareIntent(text)
                }
              } catch (e) {
                return
              }
            }}
          />
        </Appbar.Header>
      ),
    })
  })

  return (
    <Screen style={$root} preset="fixed">
      <ListView
        data={list.slice()}
        renderItem={({ item }) => (
          <ListItem
            key={item.id}
            item={item}
            onRun={() => parseText(item.id, apiKey, model)}
            onGoto={() => {
              if (item.extracted == null) {
                return
              }
              setSpendForm(getSnapshot(item).extracted!)
              deleteListItem(item.id)
              navigation.navigate("TankhahSpendForm", {})
            }}
            onDelete={() => deleteListItem(item.id)}
          />
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
    onRun: () => void
    onDelete?: () => void
    onGoto: () => void
  }) => {
    const {
      item: { text, loading, error, extracted },
      onRun,
      onDelete,
      onGoto,
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
          {!extracted ? (
            <Button disabled={loading} loading={loading} onPress={() => onRun()}>
              هضم
            </Button>
          ) : (
            <Button disabled={loading} loading={loading} onPress={() => onGoto()}>
              ادامه
            </Button>
          )}
          {onDelete && <Button onPress={() => onDelete()}>حذف</Button>}
        </Card.Actions>
      </Card>
    )
  },
)
