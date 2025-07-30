import React, { FC, useEffect, useLayoutEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppNavigation, AppStackScreenProps } from "app/navigators"
import { ListView, SearchFilterItem, SearchResultListItem } from "app/components"
import { Surface, Drawer, Appbar, useTheme, Searchbar } from "react-native-paper"
import Animated, { FadeInLeft, FadeOutLeft } from "react-native-reanimated"
import { CommonActions, useNavigation } from "@react-navigation/native"
import { useRealm } from "@realm/react"
import { SearchResultItem } from "app/models"
import { useStores } from "app/models"
import { ListRenderItemInfo } from "@shopify/flash-list"

interface CalendarSearchScreenProps extends AppStackScreenProps<"CalendarSearch"> { }

export const CalendarSearchScreen: FC<CalendarSearchScreenProps> = observer(function CalendarSearchScreen() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Pull in one of our MST stores
  const { calendarStore: { search: { search, query, typeFilter, projectFilter, clean, setRealm, setProp, sorted, projectFilterList, typeFilterList } } } = useStores()
  // Pull in navigation via hook
  const navigation = useNavigation<AppNavigation>()
  const theme = useTheme()

  const realm = useRealm()

  useEffect(() => {
    setRealm(realm)
    clean()
  }, [realm])

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "AppTabs", params: { screen: "CalendarHome", params: {} } }],
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
  }, [query, typeFilterList, projectFilterList])

  const renderDrawer = () => (
    <Animated.ScrollView nestedScrollEnabled scrollEnabled entering={FadeInLeft} exiting={FadeOutLeft} style={[$scrollView, { backgroundColor: theme.colors.background }]}>
      <Drawer.Section>
        {typeFilter.map(i => (<SearchFilterItem key={i.id} store={i}></SearchFilterItem>))}
      </Drawer.Section>
      <Drawer.Section>
        {projectFilter.map(i => (<SearchFilterItem key={i.id} store={i}></SearchFilterItem>))}
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
          })
        }} />)} data={sorted}></ListView>
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



