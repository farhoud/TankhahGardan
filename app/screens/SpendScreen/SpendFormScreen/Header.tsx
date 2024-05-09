import { CommonActions, useNavigation } from "@react-navigation/native"
import { useRealm } from "@realm/react"
import { Button, Text } from "app/components"
import { useStores } from "app/models"
import { StackNavigation } from "app/navigators"
import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { BackHandler } from "react-native"
import { Appbar, Dialog, IconButton, Portal } from "react-native-paper"
import { BSON } from "realm"

interface Props {
  jumpTo:(route:string)=>void
}

export const Header: FC<Props> = observer(function Header(props) {
  const {
    spendFormStore: { isValid, reset, submit },
  } = useStores()
  const [dialogVisible, setDialogVisible] = useState(false)
  const navigation = useNavigation<StackNavigation>()
  const realm = useRealm()

  const close = (save: boolean, itemId?:string) => {
    if (!save) {
      reset()
    }
    const params = itemId ? {itemId} : {}
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "TankhahTabs", params: { screen: "TankhahHome", params } }],
      }),
    )
  }

  useEffect(() => {
    const backAction = () => {
      setDialogVisible(true)
      return true
    }

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)

    return () => backHandler.remove()
  }, [])

  const hideDialog = () => {
    setDialogVisible(false)
  }

  const renderDialog = () => {
    return (
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Alert</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">آیا میخواهید پیشرفتتان دخیره شود</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => close(true)} tx="common.ok" />
            <Button onPress={() => close(false)} tx="common.cancel" />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  }
  return (
    <>
      <Appbar.Header>
        <Appbar.Action
          icon="close"
          onPress={() => {
            setDialogVisible(true)
          }}
        />
        <Appbar.Content title="خرج" />
        <Appbar.Action
          icon="autorenew"
          onPress={() => {
            reset()
            props.jumpTo("step1")
          }}
        />
        <Appbar.Action
          icon="content-save"
          disabled={isValid}
          onPress={() => {
            const s = submit(realm)
            if(s){
              close(false,(s?._id as BSON.ObjectId).toHexString())
            }
          }}
        />
      </Appbar.Header>
      {renderDialog()}
    </>
  )
})
