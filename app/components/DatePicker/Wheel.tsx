import React, { FC, useCallback, useEffect, useState } from "react"
import { FlatList, Pressable, View, ViewStyle } from "react-native"
import { Icon, List, Menu } from "react-native-paper"
import { GestureDetector, Gesture, TouchableWithoutFeedback } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useDerivedValue,
  interpolate,
  Extrapolation,
  useAnimatedRef,
  scrollTo,
  useAnimatedStyle,
  runOnJS,
  withTiming,
  SharedValue,
  useAnimatedReaction,
  withSpring,
} from "react-native-reanimated"
import { TextField } from "../TextField"
import { ListView } from "../ListView"

const ICON_SIZE = 25
const ITEM_HEIGHT = 35

interface WheelProps {
  range: [number, number]
  value?: number
  onScroll?: (size: number) => void
}

export const Wheel: FC<WheelProps> = (_props) => {
  const {
    range: [start, end],
    value,
    onScroll,
  } = _props

  // const animatedRef = useAnimatedRef<Animated.FlatList<any>>()
  // const scroll = useSharedValue(0)
  // const selected = useSharedValue(0)
  // const touches = useSharedValue(0)
  // const touchStart = useSharedValue(0)
  // const startScroll = useSharedValue(0)

  // const handleScroll = (size: number) => {
  //   onScroll && onScroll(size)
  // }

  // useAnimatedReaction(
  //   () => {
  //     return touches.value
  //   },
  //   (currentValue, previousValue) => {
  //     const diff = (previousValue || 0) - currentValue
  //     const direction = Math.sign(diff)

  //     const size = 8 * direction
  //     const newOffset = size + scroll.value
  //     const isInBound = newOffset <= ITEM_HEIGHT * (end - start) && newOffset > 0
  //     scroll.value = withTiming(isInBound ? newOffset : scroll.value)
  //   },
  // )

  // const pan = Gesture.Pan()
  //   .onStart((evt) => {
  //     startScroll.value = scroll.value
  //     touchStart.value = evt.absoluteY
  //     touches.value = 0
  //     selected.value = -1
  //   })
  //   .onTouchesMove((evt) => {
  //     touches.value = evt.allTouches[0].absoluteY
  //   })
  //   .onEnd((e) => {
  //     if (Math.abs(e.translationX) < 150) {
  //       let item = Math.round(
  //         (scroll.value + (Math.abs(e.translationY) > 15 ? -e.translationY / 1.1 : 0)) /
  //           ITEM_HEIGHT,
  //       )
  //       item = Math.min((end - start) * ITEM_HEIGHT, item)
  //       item = Math.max(item, 0)
  //       scroll.value = withTiming(item * ITEM_HEIGHT)
  //       selected.value = item + 1
  //       runOnJS(handleScroll)(item + start)
  //     }
  //   })

  // const renderNumber = useCallback(
  //   (index: number) => {
  //     return (
  //       <RenderNumber
  //         value={index + start - 1}
  //         selectedIndex={selected}
  //         index={index}
  //       ></RenderNumber>
  //     )
  //   },
  //   [start],
  // )

  // const $fakeItemStyle = {
  //   height: ITEM_HEIGHT,
  // }

  // useDerivedValue(() => {
  //   scrollTo(animatedRef, 0, scroll.value, true)
  // })
  // useEffect(() => {
  //   setTimeout(() => {
  //     if (value) {
  //       scroll.value = (value - start) * ITEM_HEIGHT
  //       selected.value = value - start + 1
  //     }
  //   }, 200)
  // }, [])
  const [visible, setVisible] = useState(false)
  const containerStyle = { height: ITEM_HEIGHT * 3 }
  return (
    <Menu
      onDismiss={() => {
        setVisible(false)
      }}
      visible={visible}
      contentStyle={{ width: 60 }}
      anchor={
        <Pressable
          onPressIn={() => {
            setVisible(true)
          }}
        >
          <TextField
            dense
            showSoftInputOnFocus={false}
            editable={false}
            value={value?.toString().padStart(2,"0")}
            pointerEvents="box-none"
          />
        </Pressable>
      }
      anchorPosition="bottom"
    >
      {getIndicesArray(end - start + 1).map((item) => {
        return (
          <List.Item
            onPress={() => {
              onScroll && onScroll(item + start)
              setVisible(false)
            }}
            key={item}
            style={{ width: 100 }}
            titleStyle={{ fontFamily: "IRANSansXFaNum-Regular" }}
            // onPress={() => {}}
            title={(item + start).toString().padStart(2, "0")}
          />
        )
      })}
    </Menu>
  )
  // return (
  //   <View style={{ marginVertical: 0 }}>
  //     <GestureDetector gesture={pan}>
  //       <View style={[{ paddingVertical: 30 }]}>
  //         <Animated.FlatList
  //           getItemLayout={(data, index) => {
  //             return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
  //           }}
  //           initialNumToRender={4}
  //           ref={animatedRef}
  //           scrollEventThrottle={16}
  //           showsVerticalScrollIndicator={false}
  //           scrollEnabled
  //           style={[containerStyle]}
  //           contentContainerStyle={$wheelContent}
  //           snapToAlignment="start"
  //           decelerationRate={"fast"}
  //           onScrollToIndexFailed={() => {}}
  //           snapToInterval={ITEM_HEIGHT}
  //           data={getIndicesArray(end - start + 3)}
  //           renderItem={({ index }) => {
  //             if (index === 0) {
  //               return <View style={$fakeItemStyle} />
  //             }
  //             if (index > end - start + 1) {
  //               return <View style={$fakeItemStyle} />
  //             }
  //             return renderNumber(index)
  //           }}
  //         ></Animated.FlatList>
  //       </View>
  //     </GestureDetector>
  //   </View>
  // )
}

const $wheelContent: ViewStyle = {
  flexDirection: "column",
}

const $wheelItem: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: 3,
}

const getIndicesArray = (length: number) => Array.from({ length }, (_, i) => i)

const RenderNumber = ({
  index,
  selectedIndex,
  value,
}: {
  index?: number
  selectedIndex: SharedValue<number>
  value: number
}) => {
  const aref = useAnimatedRef<View>()
  const $selectedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(index === selectedIndex.value ? 1.3 : 1) }],
    }
  }, [selectedIndex])

  const pos = value.toString().split("").reverse()

  return (
    <View style={[$wheelContainer]}>
      <Animated.View ref={aref} key={value} style={[$wheelItem, $selectedStyle]}>
        <Icon source={`numeric-${pos[0]}-box-outline`} size={ICON_SIZE} />
        <Icon source={`numeric-${pos[1] || 0}-box-outline`} size={ICON_SIZE} />
      </Animated.View>
    </View>
  )
}

const $wheelContainer: ViewStyle = {
  height: ITEM_HEIGHT,
  width: 80,
  margin: 0,
  padding: 0,
  overflow: "hidden",
}
