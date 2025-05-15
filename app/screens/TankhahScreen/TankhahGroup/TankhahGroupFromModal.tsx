import { useRealm, useObject } from "@realm/react"
import { Button, TextField } from "app/components"
import { TankhahGroup } from "app/models/realm/tankhah"
import { FC, useState, useEffect } from "react"
import { View, Switch } from "react-native"
import { DialogProps, Portal, Dialog,Text } from "react-native-paper"
import { BSON, UpdateMode } from "realm"

interface TankhahGroupFormModalProps extends Omit<DialogProps, "children"> {
    itemId?: string
    onDone?: (item?: TankhahGroup) => void
  }
  
  export const TankhahGroupFormModal: FC<TankhahGroupFormModalProps> = (_props) => {
    const { itemId, onDone, ...dialogProps } = _props
    const realm = useRealm()
    const data = useObject(TankhahGroup, new BSON.ObjectID(itemId))
  
    const [name, setName] = useState<string>()
    const [description, setDescription] = useState<string>()
    const [active, setActive] = useState(true)
    const [touched, setTouched] = useState(false)
    const [loading, setLoading] = useState(false)
  
    const [errors, setErrors] = useState<Record<string, string>>()
  
    const validateForm = () => {
      let errors: Record<string, string> = {}
      if (!name) {
        errors.name = "فیلد نام الزامیست"
      }
      setErrors(errors)
      let iv = Object.keys(errors).length === 0 || errors === undefined
      return iv
    }
  
    const handleSubmit = () => {
      setLoading(true)
      if (validateForm()) {
        const res = realm.write(() => {
          return realm.create(
            TankhahGroup,
            {
              _id: data ? data._id : new BSON.ObjectID(),
              name,
              description,
              active,
            },
            data ? UpdateMode.Modified : undefined,
          )
        })
        console.log("res:", res)
        onDone && onDone(res)
        clear()
      }
      setLoading(false)
    }
  
    const clear = () => {
      setErrors(undefined)
      setName(undefined)
      setDescription(undefined)
      setActive(false)
      setTouched(false)
    }
  
    useEffect(() => {
      if (!loading) {
        if (data) {
          setName(data.name)
          setDescription(data.description)
          console.log("data.actice:", data.active)
          setActive(data.active)
        } else {
          clear()
        }
      }
    }, [data, loading])
  
    useEffect(() => {
      if (touched) {
        validateForm()
      }
    }, [touched, name])
  
    return (
      <Portal>
        <Dialog {...dialogProps}>
          <Dialog.Title>نیروی کار</Dialog.Title>
          <Dialog.Content>
            <TextField
              dense
              placeholder="*نام"
              value={name}
              onChangeText={(value) => setName(value)}
              error={!!errors?.name}
              helper={errors?.name}
              onFocus={() => setTouched(true)}
            />
            <TextField
              dense
              placeholder="توضیحات (اختیاری)"
              value={description}
              multiline
              numberOfLines={1}
              onChangeText={(value) => setDescription(value)}
              onFocus={() => setTouched(true)}
            />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text variant="labelMedium">فعال</Text>
              <Switch
                value={active}
                onValueChange={(value) => setActive(value)}
              />
            </View>
  
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              disabled={!name}
              tx={!itemId ? "common.add" : "common.save"}
              onPress={handleSubmit}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  }
  