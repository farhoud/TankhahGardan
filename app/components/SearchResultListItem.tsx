import { formatDateIR } from "app/utils/formatDate"
import { View } from "react-native"
import Reanimated, { BounceIn, FadeOut } from "react-native-reanimated"
import { List, Text } from "react-native-paper"
import { SearchResultItem } from "app/models"


export interface SearchResultItemProps {
  item: SearchResultItem,
  onPress?: (id: string) => void
  onLongPress?: (id: string) => void
}

export function SearchResultListItem(props: SearchResultItemProps) {
  const { item, onPress, onLongPress } = props

  return (
    <Reanimated.View entering={BounceIn} exiting={FadeOut}>
      <List.Item
        unstable_pressDelay={50}
        left={(props) => item.icon && <List.Icon {...props} icon={item.icon} />}
        right={() => (
          <View>
            <Text style={{ textAlign: "right" }} variant="labelSmall">
              {item.timestamp && formatDateIR(item.timestamp)}
            </Text>
            {item.rightText && <Text variant="labelMedium" style={{ textAlign: "right" }}>{item.rightText}</Text>}
          </View>
        )}
        titleStyle={{ fontFamily: "IRANSansXFaNum-Regular", fontSize: 14 }}
        descriptionStyle={{ fontFamily: "IRANSansXFaNum-Regular", fontSize: 12 }}
        title={item.title}
        titleNumberOfLines={2}
        description={item.description}
        onPress={() => { onPress && onPress(item.id) }}
        onLongPress={() => { onLongPress && onLongPress(item.id) }}
      />
    </Reanimated.View>

  )
}




