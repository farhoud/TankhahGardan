import React, { FC, useEffect } from "react"
import { View, ViewStyle } from "react-native"
import { Icon } from "react-native-paper"
import { GestureDetector, Gesture } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useDerivedValue,
  withClamp,
  interpolate,
  Extrapolation,
  useAnimatedRef,
  scrollTo,
  withSpring,
  useAnimatedStyle,
  runOnJS,
  withTiming,
} from "react-native-reanimated"

const ICON_SIZE = 25

interface WheelProps {
  range: [number, number]
  min?: number
  max?: number
  defaultValue?: number
  onSelect?: (value: number) => void
}

export const Wheel: FC<WheelProps> = (_props) => {
  const {
    range: [start, end],
    defaultValue,
    onSelect,
  } = _props

  const minNumber = useSharedValue(0)
  const maxNumber = useSharedValue(0)
  const scroll = useSharedValue<number>(0)
  const childrenHeight = useSharedValue(0)
  const selected = useSharedValue(0)
  const animatedRef = useAnimatedRef<Animated.ScrollView>()

  const handleSelect = (index: number) => {
    onSelect && onSelect(index + start)
  }

  const fling = Gesture.Pan()
    .onEnd((e) => {
      const direction = Math.sign(e.translationY) * -1
      const size = Math.floor(
        interpolate(Math.abs(e.translationY), [1, 30, 60, 150], [1, 1, 2, 5], Extrapolation.CLAMP),
      )
      if (Math.abs(e.translationX) < 80) {
        const temp = scroll.value + size * direction
        const minScroll = minNumber.value - start
        const maxScroll = maxNumber.value - start 
        const scrollValue = Math.max(minScroll, Math.min(temp, maxScroll))
        selected.value = scrollValue
        scroll.value = withClamp(
          { min: minScroll, max: maxScroll },
          withSpring(temp),
        )
        runOnJS(handleSelect)(scrollValue)
      }
    })
    .hitSlop({ vertical: 10 })


  const renderNumber = (index: number) => {
    const aref = useAnimatedRef<View>()
    const m = useDerivedValue(() => {
      return index === selected.value
    })
    const $selectedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: withTiming(m.value ? 1.3 : 1,{duration:500}) }],
      }
    })
    const i = index + start
    const pos = i.toString().split("").reverse()

    useEffect(() => {
      minNumber.value = _props.min || start
      maxNumber.value = _props.max || end
      if (_props.max && scroll.value > _props.max - start) {
        scroll.value = _props.max
        selected.value = _props.max
      }
      if (_props.min && scroll.value < _props.min - start) {
        scroll.value = _props.min
        selected.value = _props.min
      }
    }, [_props.min, _props.max, start, end])

    return (
      <Animated.View
        ref={aref}
        key={i}
        style={[
          $wheelItem,
          $selectedStyle,
        ]}
      >
        <Icon source={`numeric-${pos[0]}-box-outline`} size={ICON_SIZE} />
        <Icon source={`numeric-${pos[1] || 0}-box-outline`} size={ICON_SIZE} />
      </Animated.View>
    )
  }
  const fakeItemStyle = useAnimatedStyle(() => ({
    height: childrenHeight.value,
  }))

  useDerivedValue(() => {
    scrollTo(animatedRef, 0, scroll.value * childrenHeight.value, true)
  })
  useEffect(() => {
    if (defaultValue) {
      scroll.value = defaultValue - start
      selected.value = defaultValue - start
    }
  }, [])
  const containerStyle = useAnimatedStyle(() => ({ height: childrenHeight.value * 3 + 3 }))
  return (
    <>
      <MeasureElement onLayout={(h) => (childrenHeight.value = h)}>
        {renderNumber(1)}
      </MeasureElement>
      <GestureDetector gesture={fling}>
        <Animated.ScrollView
          ref={animatedRef}
          showsVerticalScrollIndicator={false}
          scrollEnabled
          style={[$wheel, containerStyle]}
          contentContainerStyle={$wheelContent}
        >
          <Animated.View style={fakeItemStyle} />
          <Cloner count={end - start + 1} renderNumber={renderNumber} />
          <Animated.View style={fakeItemStyle} />
          <Animated.View style={fakeItemStyle} />
        </Animated.ScrollView>
      </GestureDetector>
    </>
  )
}

const $wheel: ViewStyle = {
  maxWidth: 70,
}
const $wheelContent: ViewStyle = {
  flexDirection: "column",
}

const $wheelItem: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: 2
}

const MeasureElement = ({
  onLayout,
  children,
}: {
  onLayout: (height: number) => void
  children: React.ReactNode
}) => (
  <Animated.ScrollView
    style={{ opacity: 0, zIndex: -3, position: "absolute" }}
    pointerEvents="box-none"
  >
    <View onLayout={(ev) => onLayout(ev.nativeEvent.layout.height)}>{children}</View>
  </Animated.ScrollView>
)


const getIndicesArray = (length: number) => Array.from({ length }, (_, i) => i)

const Cloner = ({
  count,
  renderNumber,
}: {
  count: number
  renderNumber: (i: number) => React.ReactNode
}) => <>{getIndicesArray(count).map(renderNumber)}</>

