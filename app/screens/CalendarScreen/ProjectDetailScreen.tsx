import React, { FC, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, View } from "react-native"
import { AppNavigation, AppStackScreenProps } from "app/navigators"
import { ListView, Screen, Text } from "app/components"
import { useNavigation } from "@react-navigation/native"
import { useObject, useRealm } from "@realm/react"
import { BSON, UpdateMode } from "realm"
import { Attendance, Project, Event } from "app/models/realm/calendar"
import { Appbar, IconButton, List, useTheme } from "react-native-paper"
import { ListRenderItem } from "@shopify/flash-list"
import { format } from "date-fns-jalali"
import { formatDateIR } from "app/utils/formatDate"
import { ProjectModal } from "./ProjectListScreen"
import { BottomSheetFormRef, BottomSheetForm } from "./BottomSheetForm"

interface ProjectDetailScreenProps extends AppStackScreenProps<"ProjectDetail"> {}

export const ProjectDetailScreen: FC<ProjectDetailScreenProps> = observer(
  function ProjectDetailScreen(_props) {
    const itemId = _props.route.params.itemId
    // Pull in one of our MST stores
    const theme = useTheme()
    const realm = useRealm()

    // Pull in navigation via hook
    const navigation = useNavigation<AppNavigation>()

    const formRef = useRef<BottomSheetFormRef>(null)

    const item = useObject(Project, new BSON.ObjectID(itemId))

    const [visible, setVisible] = useState(false)

    const handleBack = () => {
      navigation.canGoBack() && navigation.goBack()
    }

    const handleDeleteItem = () => {
      if (item) {
        realm.write(() => {
          return realm.create(Project, { ...item, deleted: true }, UpdateMode.Modified)
        })
        navigation.goBack()
      }
    }

    if (!item) {
      return <></>
    }

    const renderHeader = () => (
      <>
        <Appbar>
          <Appbar.BackAction onPress={handleBack}></Appbar.BackAction>
        </Appbar>
        <View>
          <Text variant="headlineLarge" text={item?.name} style={{ textAlign: "center" }} />
          <Text variant="headlineMedium" text={item.description} style={{ textAlign: "center" }} />
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <IconButton mode="outlined" icon={"delete"} size={26} onPress={handleDeleteItem} />
            <IconButton
              mode="outlined"
              icon={"account-edit"}
              size={26}
              onPress={() => {
                setVisible(true)
              }}
            />
          </View>
        </View>
      </>
    )

    const renderItem: ListRenderItem<Attendance | Event | string> = ({ item }) => {
      if (typeof item === "string") {
        return <List.Subheader>{item}</List.Subheader>
      }
      if (item instanceof Attendance) {
        return (
          <List.Item
            title={`${formatDateIR(item.from)} ${format(item.from, "HH:mm")} - ${format(
              item.to || item.from,
              "HH:mm",
            )}`}
            titleStyle={theme.fonts.bodyMedium}
            right={() => <Text>{item.worker.name}</Text>}
            description={item.description}
            onPress={() => {
              formRef.current?.editForm(item)
            }}
          />
        )
      }
      return (
        <List.Item
          title={`${formatDateIR(item.from)} ${format(item.from, "HH:mm")} - ${format(
            item.to || item.from,
            "HH:mm",
          )}`}
          titleStyle={theme.fonts.bodyMedium}
          right={() => <Text>{item.title}</Text>}
          description={item.description}
          onPress={() => {
            formRef.current?.editForm(item)
          }}
        />
      )
    }

    const listData = useMemo(() => {
      return ["حضور", ...item.attendances, "رخداد", ...item.events]
    }, [item.attendances, item.events])

    return (
      <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
        {renderHeader()}
        <List.Subheader>رخدادها</List.Subheader>
        <ListView data={listData} renderItem={renderItem} />
        <ProjectModal
          onDone={(item) => {
            setVisible(false)
          }}
          onDismiss={() => {
            setVisible(false)
          }}
          visible={visible}
          itemId={itemId}
        ></ProjectModal>
        <BottomSheetForm ref={formRef} />
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}
