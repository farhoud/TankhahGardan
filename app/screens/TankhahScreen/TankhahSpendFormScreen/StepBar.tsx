import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native"
import { IconButton, useTheme } from "react-native-paper"
import { Text } from "app/components"
import { NavigationState, Route, SceneRendererProps } from "react-native-tab-view"
import React from "react"

type State = NavigationState<Route>

type StepBarProps = SceneRendererProps & { navigationState: State }

/**
 * @param {StepBarProps} props - The props for the `DemoDivider` component.
 * @returns {JSX.Element} The rendered `DemoDivider` component.
 */
export function StepBar(props: StepBarProps) {
  const { colors } = useTheme()
  const $background = colors.surfaceVariant
  const { width } = useWindowDimensions()

  const renderItem =
    ({
      navigationState,
      position,
    }: {
      navigationState: State
      position: Animated.AnimatedInterpolation<number>
    }) =>
    ({ route, index }: { route: Route; index: number }) => {
      const inputRange = navigationState.routes.map((_, i) => i)

      const activeOpacity = position.interpolate({
        inputRange,
        outputRange: inputRange.map((i: number) => (i >= index ? 1 : 0)),
      })
      const inactiveOpacity = position.interpolate({
        inputRange,
        outputRange: inputRange.map((i: number) => (i >= index ? 0 : 1)),
      })

      const tabWidth = (width - 110) / (navigationState.routes.length * 2)

      const $dash: ViewStyle = {
        height: 5,
        width: tabWidth,
      }
      const $startDash = {
        backgroundColor: index === 0 ? $background : colors.secondary,
        marginLeft: -17,
      }
      const $endDash = {
        backgroundColor: index === inputRange.length - 1 ? $background : colors.secondary,
        marginRight: -17,
      }

      const $startDashActive = {
        backgroundColor: index === 0 ? $background : colors.primary,
        marginLeft: -17,
      }
      const $endDashActive = {
        backgroundColor: index === inputRange.length - 1 ? $background : colors.primary,
        marginRight: -17,
      }

      return (
        <View style={styles.tab}>
          <Animated.View style={[styles.item, { opacity: inactiveOpacity }]}>
            <View style={$col}>
              <View style={$row}>
                <View style={[$dash, $startDash]}></View>

                <IconButton
                  icon={`numeric-${index + 1}-circle`}
                  iconColor={colors.secondary}
                  size={30}
                />

                <View style={[$dash, $endDash]}></View>
              </View>
              <View style={{ alignSelf: "center" }}>
                <Text style={{ textAlign: "center" }} text={route.title}></Text>
              </View>
            </View>
          </Animated.View>
          <Animated.View style={[styles.item, styles.activeItem, { opacity: activeOpacity }]}>
            <Animated.View style={$col}>
              <Animated.View style={$row}>
                <Animated.View style={[$dash, $startDashActive]} />

                <IconButton
                  icon={`numeric-${index + 1}-circle`}
                  iconColor={colors.primary}
                  size={30}
                />

                <View style={[$dash, $endDashActive]}></View>
              </Animated.View>
              <Animated.View style={{ alignSelf: "center" }}>
                <Text
                  style={{ textAlign: "center", color: colors.primary }}
                  text={route.title}
                ></Text>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </View>
      )
    }

  return (
    <View style={[styles.tabbar, { backgroundColor: $background }]}>
      {props.navigationState.routes.map((route: Route, index: number) => {
        return (
          <TouchableWithoutFeedback
            key={route.key}
            onPress={() => {
              props.jumpTo(route.key)
            }}
          >
            {renderItem(props)({ route, index })}
          </TouchableWithoutFeedback>
        )
      })}
    </View>
  )
}

const $col: ViewStyle = { display: "flex", flexDirection: "column", alignItems: "center" }
const $row: ViewStyle = { display: "flex", flexDirection: "row-reverse", alignItems: "center" }

const styles = StyleSheet.create({
  active: {
    color: "#0084ff",
  },
  activeItem: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  icon: {
    height: 26,
    width: 26,
  },
  inactive: {
    color: "#939393",
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4.5,
  },
  label: {
    backgroundColor: "transparent",
    fontSize: 10,
    marginBottom: 1.5,
    marginTop: 3,
  },
  tab: {
    // flex: 1,
    marginBottom: 10,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, .2)",
  },
  tabbar: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    // backgroundColor: "#fafafa",
  },
})
