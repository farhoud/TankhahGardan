import React, { ReactNode, Ref, forwardRef, useImperativeHandle, useMemo, useRef } from "react"
import { useTheme } from "react-native-paper"
import { BottomSheetModal, BottomSheetModalProps, BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet"

interface BottomSheetProps
  extends BottomSheetModalProps,
    Omit<BottomSheetModalProps, "ref" | "children"> {
  onDone?: () => void
  children: ReactNode
}

export const BottomSheet = forwardRef(function BottomSheet(
  props: BottomSheetProps,
  ref: Ref<BottomSheetModal>,
) {
  const {
    onDone,
    enablePanDownToClose,
    children,
    keyboardBehavior,
    keyboardBlurBehavior,
    enableDynamicSizing,
    ...modalProps
  } = props
  const theme = useTheme()
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  useImperativeHandle(ref, () => bottomSheetRef.current as BottomSheetModal)

  return (
    <BottomSheetModal
      {...modalProps}
      enablePanDownToClose={enablePanDownToClose || true}
      keyboardBlurBehavior={keyboardBlurBehavior || "restore"}
      keyboardBehavior={keyboardBehavior || "extend"}
      ref={bottomSheetRef}
      enableDynamicSizing={enableDynamicSizing||true}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
    >
      <BottomSheetScrollView>{children}</BottomSheetScrollView>
    </BottomSheetModal>
  )
})
