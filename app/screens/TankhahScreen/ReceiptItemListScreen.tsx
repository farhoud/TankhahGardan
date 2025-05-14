import { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps, AppNavigation } from "app/navigators"
import { Project } from "app/models/realm/calendar"
import { Appbar, Dialog, DialogProps, List, Portal, Searchbar, useTheme } from "react-native-paper"
import { useObject, useQuery, useRealm } from "@realm/react"
import { BSON, UpdateMode } from "realm"
import { Button, CurrencyField, ListView, ListViewRef, TextField } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { ReceiptItem } from "app/models/realm/tankhah"

interface ReceiptItemListScreenProps extends AppStackScreenProps<"ReceiptItemList"> {}

export const ReceiptItemListScreen: FC<ReceiptItemListScreenProps> = observer(
  function BuyItemListScreen(_props) {
    const navigation = useNavigation<AppNavigation>()

    const refList = useRef<ListViewRef<ReceiptItem | string>>(null)
    const [visible, setVisible] = useState(false)
    const [selected, setSelected] = useState<ReceiptItem>()
    const [search, setSearch] = useState("")
    const [res, setRes] = useState<ReceiptItem>()

    const data = useQuery(
      ReceiptItem,
      (res) => {
        return res.filtered("title Contains $0", search)
      },
      [search],
    )

    useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: true,
        header: () => (
          <Appbar.Header>
            <Appbar.BackAction
              onPress={() => {
                navigation.canGoBack() && navigation.goBack()
              }}
            />
            <Appbar.Action
              icon="plus"
              onPress={() => {
                setSelected(undefined)
                setVisible(true)
              }}
            />
          </Appbar.Header>
        ),
      })
    })

    const renderItem = ({ item }: { item: ReceiptItem | string }) => {
      if (item instanceof ReceiptItem) {
        return (
          <List.Item
            onPress={() => {
              // navigation.navigate("ReceiptItemDetail", { itemId: item._id.toHexString() })
              setSelected(item)
              setVisible(true)
              
            }}
            title={item.title}
            description={item.description}
          />
        )
      }
      return (
        <>
          <List.Subheader>{item}</List.Subheader>
        </>
      )
    }

    useEffect(() => {
      if (res) {
        const index = data.findIndex((i) => i._objectKey() === res._objectKey())
        if (index > -1) refList.current?.scrollToIndex({ animated: true, index: index })
        setRes(undefined)
      }
    }, [res])

    return (
      <>
        <Searchbar
          value={search}
          onChangeText={(value) => {
            setSearch(value)
          }}
          clearButtonMode="while-editing"
        ></Searchbar>
        <ListView
          ref={refList}
          keyExtractor={(i) => (i instanceof ReceiptItem ? i._objectKey() : i)}
          data={data.slice()}
          renderItem={renderItem}
          style={$root}
        ></ListView>
        {/* </List.Section> */}
        <ReceiptItemModal
          onDone={(item) => {
            setRes(item)
            setSelected(undefined)
            setVisible(false)
          }}
          onDismiss={() => {
            setVisible(false)
            setSelected(undefined)
          }}
          visible={visible}
          itemId={selected?._id.toHexString()}
        ></ReceiptItemModal>
      </>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

interface ReceiptItemModalProps extends Omit<DialogProps, "children"> {
  itemId?: string
  onDone?: (item?: ReceiptItem) => void
}

export const ReceiptItemModal: FC<ReceiptItemModalProps> = (_props) => {
  const { itemId, onDone, ...dialogProps } = _props
  const realm = useRealm()
  const data = useObject(ReceiptItem, new BSON.ObjectID(itemId))
  const theme = useTheme()

  const [title, setTitle] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [touched, setTouched] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [defaultPrice, setDefaultPrice] = useState<number>()
  const [errors, setErrors] = useState<Record<string, string>>()

  const validateForm = () => {
    let errors: Record<string, string> = {}
    if (!title) {
      errors.title = "فیلد نام الزامیست"
    }
    setErrors(errors)
    setIsValid(Object.keys(errors).length === 0)
  }

  const handleSubmit = () => {
    validateForm()
    if (isValid) {
      const res = realm.write(() => {
        return realm.create(
          ReceiptItem,
          {
            _id: data ? data._id : new BSON.ObjectID(),
            title,
            description,
            defaultPrice,
            searchable:true,
          },
          data ? UpdateMode.Modified : undefined,
        )
      })
      onDone && onDone(res)
      clear()
    }
  }

  const handleDelete=()=>{
    realm.write(()=>{
      realm.delete(data)
    })
    onDone && onDone()
  }

  const clear = () => {
    setErrors(undefined)
    setTitle(undefined)
    setDescription(undefined)
    setDefaultPrice(undefined)
    setTouched(false)
    setIsValid(false)
  }

  useEffect(() => {
    if (data) {
      setTitle(data.title)
      setDescription(data.description)
      setDefaultPrice(data.defaultPrice)
    } else {
      clear()
    }
  }, [data])

  useEffect(() => {
    if (touched) {
      validateForm()
    }
  }, [touched, title])
  

  return (
    <Portal>
      <Dialog {...dialogProps}>
        <Dialog.Title>نیروی کار</Dialog.Title>
        <Dialog.Content>
          <TextField
            placeholder="*نام"
            value={title}
            onChangeText={(value) => setTitle(value)}
            error={!!errors?.title}
            helper={errors?.title}
            onFocus={() => setTouched(true)}
          />
          <CurrencyField
              value={defaultPrice}
              onChangeValue={(value) => setDefaultPrice(value)}
              labelTx="receiptItemForm.defaultPriceLabel"
              placeholderTx="receiptItemForm.defaultPricePlaceholder"
            />
          <TextField
            placeholder="توضیحات (اختیاری)"
            value={description}
            multiline
            numberOfLines={1}
            onChangeText={(value) => setDescription(value)}
            onFocus={() => setTouched(true)}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button tx={!itemId ? "common.add" : "common.save"} onPress={handleSubmit} />
          {!!itemId&&<Button text={"خذف"} onPress={handleDelete} />}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}
