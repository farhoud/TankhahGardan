import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { useTheme } from "react-native-paper"
import Animated, {
  useSharedValue,
  useDerivedValue,
  withTiming,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated"

export interface TimeIndicatorProps {
  /**
   * An optional date for indicator
   */
  date?: Date
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const TimeIndicator = observer(function TimeIndicator(props: TimeIndicatorProps) {
  const { style } = props
  const $styles = [$container, style]
  const timeIndicator = useSharedValue(0)
  const width = useSharedValue(0)
  const { colors } = useTheme()
  const timeIndicatorPast = useDerivedValue(() => {
    return withTiming(interpolate(timeIndicator.value, [0, 1440], [0, width.value]), { duration: 1000 })
  })
  const timeIndicatorFuture = useDerivedValue(() => {
    return withTiming(width.value, { duration: 1000 })
  })

  const $timePast = useAnimatedStyle(() => ({
    // transform: [{ scaleX: timeIndicatorPast.value }],
    backgroundColor: colors.inverseOnSurface,
    height: 10,
    width: timeIndicatorPast.value,
    // alignSelf: "flex-end",
    zIndex:2,
  }))

  const $timeFuture = useAnimatedStyle(() => ({
    // transform: [{ scaleX: timeIndicatorFuture.value }],
    backgroundColor: colors.primary,
    height: 10,
    width: timeIndicatorFuture.value,
    marginTop: -10,
    // zIndex:1
  }))


  React.useEffect(() => {
    const setDate = ()=>{
      const now = new Date()
      timeIndicator.value = now.getMinutes() + now.getHours() * 60
    }
    setDate()
    const s = setInterval(setDate, 60000)
    return () => {
      clearInterval(s)
    }
  }, [])

  return (
    <View
      onLayout={(ev) => {
        width.value = ev.nativeEvent.layout.width
      }}
      style={$styles}
    >
      <Animated.View style={$timePast}></Animated.View>
      <Animated.View style={$timeFuture}></Animated.View>
    </View>
  )
})

const $container: ViewStyle = {
  justifyContent: "center",
  width: "100%",
}
