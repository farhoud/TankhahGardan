import React, { FC, useEffect, useLayoutEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppNavigation, AppStackParamList, AppStackScreenProps } from "app/navigators"
import { ListView, SearchFilterItem, SearchResultListItem } from "app/components"
import { Surface, Drawer, Appbar, useTheme, Searchbar } from "react-native-paper"
import Animated, { FadeInLeft, FadeOutLeft } from "react-native-reanimated"
import { CommonActions, RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useRealm } from "@realm/react"
import { SearchResultItem } from "app/models"
import { useStores } from "app/models"
import { ListRenderItemInfo } from "@shopify/flash-list"

interface TankhahSearchScreenProps extends AppStackScreenProps<"TankhahSearch"> { }

export const TankhahSearchScreen: FC<TankhahSearchScreenProps> = observer(function TankhahSearchScreen() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Pull in one of our MST stores
  const { tankhahHomeStore: { search: { search, query, opFilter, pmFilter, gpFilter, clean, setRealm, setProp, result, gpFilterList, opFilterList } } } = useStores()
  // Pull in navigation via hook
  const navigation = useNavigation<AppNavigation>()
  const route = useRoute<RouteProp<AppStackParamList, "TankhahSearch">>()
  const { archiveId } = route.params || { archiveId: undefined }
  const theme = useTheme()



  const realm = useRealm()

  useEffect(() => {
    setRealm(realm)
    clean()
    setProp("archiveId", archiveId)
  }, [realm, archiveId])

  const goBack = () => {
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
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <Appbar.Header>
          <Appbar.BackAction onPress={goBack}></Appbar.BackAction>
          <Appbar.Content title="" />
          <Appbar.Action
            icon="menu"
            onPress={() => {
              console.log(drawerOpen)
              setDrawerOpen(prev => !prev)
            }}
          />
        </Appbar.Header>
      ),
    })
  }, [])

  useEffect(() => {
    search()
  }, [query, opFilterList, gpFilterList])

  const renderDrawer = () => (
    <Animated.ScrollView nestedScrollEnabled scrollEnabled entering={FadeInLeft} exiting={FadeOutLeft} style={[$scrollView, { backgroundColor: theme.colors.background }]}>
      <Drawer.Section>
        {/* <Text text="عملیات" /> */}
        {gpFilter.map(i => (<SearchFilterItem store={i}></SearchFilterItem>))}
      </Drawer.Section>
      <Drawer.Section>
        {/* <Text text="عملیات" /> */}
        {opFilter.map(i => (<SearchFilterItem store={i}></SearchFilterItem>))}

      </Drawer.Section>
      <Drawer.Section>
        {/* <Text text="عملیات" /> */}
        {pmFilter.map(i => (<SearchFilterItem store={i}></SearchFilterItem>))}
      </Drawer.Section>
    </Animated.ScrollView >
  )
  return (
    <>
      <Surface style={[$root]}>
        <Searchbar
          placeholder="جستجو"
          onChangeText={(text) => { setProp("query", text) }}
          value={query}
        />
        <ListView renderItem={(props: ListRenderItemInfo<SearchResultItem>) => (<SearchResultListItem {...props} onPress={(id) => {
          navigation.navigate("TankhahItem", {
            itemId: id,
            archived: !!archiveId
          })
        }} />)} data={result}></ListView>
        {drawerOpen && renderDrawer()}
      </Surface >
    </>
  )
})

const $root: ViewStyle = {
  flex: 1,
  position: "relative"
}

const $scrollView: ViewStyle = { height: "100%", width: 300, position: "absolute", right: 0 }



