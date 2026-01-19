// Version web de HelloWave - utilise Text standard au lieu d'Animated
import { Text } from 'react-native';

export function HelloWave() {
  return (
    <Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
      }}>
      👋
    </Text>
  );
}
