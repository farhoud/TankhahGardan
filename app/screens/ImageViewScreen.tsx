import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { Animated, StyleProp, ViewStyle, Image, ImageStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { AutoImage, Screen, Text } from "app/components"
import { RectButton, Swipeable } from "react-native-gesture-handler"
import { useTheme } from "react-native-paper"
import Reanimated, { BounceIn } from "react-native-reanimated"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface ImageViewScreenProps extends AppStackScreenProps<"ImageView"> {}
type AnimatedInterpolation = Animated.AnimatedInterpolation<string | number>

export const ImageViewScreen: FC<ImageViewScreenProps> = observer(function ImageViewScreen(_props) {
  const { images, index:indexProp } = _props.route.params
  // const theme = useTheme()
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()
  const [index, setIndex] = useState(indexProp||0)

  const nextImage = (index: number) => {
    if (images.length > index + 1) {
      return index + 1
    }
    return 0
  }

  const prevImage = (index: number) => {
    if (index - 1 >= 0) {
      return index - 1
    }
    return images.length - 1
  }

  const goNext = () => {
    setIndex(nextImage(index))
  }

  const goPrev = () => {
    setIndex(prevImage(index))
  }

  const renderItemActions =
    (action: "left" | "right") =>
    (progress: AnimatedInterpolation, dragX: AnimatedInterpolation) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100, 101],
        outputRange: [-20, 0, 0, 1],
      })
      return (
        <RectButton>
         
        </RectButton>
      )
    }

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} safeAreaEdges={["bottom"]} preset="fixed">
      <Swipeable
        renderLeftActions={renderItemActions("left")}
        renderRightActions={renderItemActions("right")}
        onSwipeableOpenStartDrag={(direction) => {
          direction === "left" ? goNext() : goPrev()
        }}
      >
        <Reanimated.Image
          entering={BounceIn}
          style={$image}
          resizeMode="contain"
          source={{ uri: images[index] }}
        ></Reanimated.Image>
      </Swipeable>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $image: StyleProp<ImageStyle> = {
  alignSelf: "center",
  height: "100%",
  width: "100%",
}
