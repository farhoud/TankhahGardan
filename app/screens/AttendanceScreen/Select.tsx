import { $row, spacing } from "app/theme"
import { TouchableHighlight, View } from "react-native"
import { Chip, Icon, useTheme } from "react-native-paper"
import { Text } from "app/components"
interface SelectOption<T> {
  label: string
  key: string
  item: T
}
interface SelectProps<T> {
  placeholder: string
  icon: string
  onPress: () => void
  onItemPress?: (item: SelectOption<T>) => void
  selected?: SelectOption<T>[] | string
  error?: string
}

export const Select = <T,>(props: SelectProps<T>) => {
  const { placeholder, icon, onPress, selected, onItemPress, error } = props
  const theme = useTheme()

  return (
    <TouchableHighlight onPress={onPress}>
      <View
        style={[
          $row,
          {
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: spacing.xs,
            paddingBottom: spacing.xs,
          },
        ]}
      >
        <View style={{ marginStart: spacing.sm, marginEnd: spacing.xxs }}>
          <Icon source={icon} size={28} color={theme.colors.onSurface} />
        </View>
        {selected === undefined && (
          <Text variant="bodyMedium" style={{ marginStart: spacing.sm }}>
            {placeholder}
          </Text>
        )}
        {!(selected instanceof Array) && (
          <Text variant="bodyMedium" style={{ marginStart: spacing.sm }}>
            {selected}
          </Text>
        )}
        {selected instanceof Array &&
          selected.map((i) => (
            <Chip
              style={{ marginStart: spacing.xxs }}
              icon="close"
              key={i.key}
              compact
              onPress={() => {
                onItemPress && onItemPress(i)
              }}
            >
              {i.label}
            </Chip>
          ))}
        {error && (
          <Text variant="labelLarge" text={error} style={{ color: theme.colors.error, textAlign:"right", marginStart:20 }}></Text>
        )}
      </View>
    </TouchableHighlight>
  )
}
