import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppNavigation, AppTabScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface ProjectHomeScreenProps extends AppTabScreenProps<"ProjectHome"> {}

export const ProjectHomeScreen: FC<ProjectHomeScreenProps> = observer(function ProjectHomeScreen(_props) {
  // const {itemId} = _props.route?.params?.itemId
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation<AppNavigation>()

  return (
    <Screen style={$root} preset="scroll">
      <Text text="projectHome" />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
