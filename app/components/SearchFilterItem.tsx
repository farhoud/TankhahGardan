import { SearchFilter } from "app/models"
import { observer } from "mobx-react-lite"
import { Drawer, Switch } from "react-native-paper"

export const SearchFilterItem = observer((props: { store: SearchFilter }) => {
  const { store: { id, name, toggle, value } } = props
  return (< Drawer.Item
    right={() =>
      <Switch
        onValueChange={() => toggle()}
        value={value}
      />
    }
    style={{ flex: 1 }}
    id={id}
    label={name} >
  </Drawer.Item >)
})
