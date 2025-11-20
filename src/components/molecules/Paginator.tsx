import { View, StyleSheet, Animated, FlatList } from 'react-native';
import NextButton from '@/components/atoms/NextButton';
import PaginatorDots from '../atoms/PaginatorDots';
import { OnboardingItemsProps } from '@/types/Onboarding';

const Paginator = ({
  ScrollX,
  slide,
  slideIndex,
  scrollTo,
}: {
  ScrollX: Animated.Value;
  slide: React.RefObject<FlatList<OnboardingItemsProps> | null>;
  slideIndex: number;
  scrollTo: () => void;
}) => {
  return (
    <View style={styles.container}>
      <PaginatorDots scrollX={ScrollX} />
      <NextButton scrollTo={scrollTo} slideIndex={slideIndex} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
});
export default Paginator;
