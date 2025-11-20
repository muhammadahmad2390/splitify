import { View, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { OnboardingsScreens } from '@/screens/Onboardings';

const PaginatorDots = ({ scrollX }: { scrollX: Animated.Value }) => {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.dotContainer}>
      {OnboardingsScreens.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.5, 1, 0.5],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            style={[styles.dot, { width: dotWidth, opacity }]}
            key={i}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  dot: {
    // width: 10,
    height: 10,
    // backgroundColor: 'rgb(33, 46, 94)',
    backgroundColor: 'rgb(1, 72, 101)',
    borderRadius: 5,
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default PaginatorDots;
