import { useEffect } from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { useTheme } from "react-native-paper"
import Animated, {
  useSharedValue,
  useDerivedValue,
  withTiming,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated"
export interface TimeRangeIndicatorProps {
  /**
   * An optional date for indicator
   */
  range: [Date, Date]
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const TimeRangeIndicator = observer(function TimeRangeIndicator(
  props: TimeRangeIndicatorProps,
) {
  const { style, range } = props
  const { colors } = useTheme()
  const $styles: StyleProp<ViewStyle> = [$container, style, { backgroundColor: "transparent" }]
  const offset = useSharedValue(0)
  const indicatorWidth = useSharedValue(0)
  const width = useSharedValue(0)
  const animatedWidth = useDerivedValue(() => {
    return withTiming(interpolate(indicatorWidth.value, [0, 1440], [0, width.value]), {
      duration: 1000,
    })
  })
  const timeRangeTransX = useDerivedValue(() => {
    return withTiming(interpolate(offset.value, [0, 1440], [0, width.value]), { duration: 1000 })
  })

  const $timeRangeStyle = useAnimatedStyle(() => ({
    backgroundColor: colors.secondary,
    height: 1,
    width: animatedWidth.value,
    zIndex: 9,
  }))

  const $timeTextStyle = useAnimatedStyle(() => ({
    marginStart: timeRangeTransX.value,
    zIndex: 9,
  }))

  const $timeTextEndStyle = useAnimatedStyle(() => ({
    color: "red",
    zIndex: 9,
  }))

  useEffect(() => {
    const [start, end] = range.map((i) => i.getMinutes() + i.getHours() * 60)
    offset.value = start
    indicatorWidth.value = end - start
  }, [range])

  return (
    <View
      onLayout={(ev) => {
        width.value = ev.nativeEvent.layout.width
      }}
      style={$styles}
    >
      <Animated.View style={$timeTextStyle}></Animated.View>
      <Animated.View style={$timeRangeStyle} />
      <Animated.View style={$timeTextEndStyle}></Animated.View>
    </View>
  )
})

const $container: ViewStyle = {
  width: "100%",
  alignItems: "stretch",
  flexDirection: "row",
}
