import { formatDateIRDisplay } from "app/utils/formatDate"
import { Button } from "react-native-paper"


interface TimeRangesBtnProps {
  type: "start" | "end"
  open: () => void
  value?: Date
}

export function TimeRangeBtn(props: TimeRangesBtnProps) {
  const { type, open, value } = props

  return (
    <Button
      // style={$controlsBtn}
      onPress={open}
    >
      {(type === "start" ? " از " : "تا ") + (value ? formatDateIRDisplay(value, "dd MMM yy") : " : ")}
    </Button>
  )
}
