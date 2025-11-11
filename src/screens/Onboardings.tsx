import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ViewToken,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import OnboardingItem from '@/components/molecules/OnboardingItem';
import { OnboardingItemsProps } from '@/types/Onboarding';
import { useRef, useState } from 'react';
import Paginator from '@/components/molecules/Paginator';
const { width, height } = Dimensions.get('window');

const OnboardingsScreens: OnboardingItemsProps[] = [
  {
    id: 1,
    img: require('@/assets/onboardings/onboarding_1.png'),
    title: 'Create groups for trips, events, or everyday sharing',
    description: 'Create groups,and let Splitify do the math.',
  },
  {
    id: 2,
    img: require('@/assets/onboardings/onboarding_2.png'),
    title: 'Split every expense accurately and track who owes what',
    description: 'See balances at a glance and keep your groups crystal clear.',
  },
  {
    id: 3,
    img: require('@/assets/onboardings/onboarding_3.png'),
    title: 'Settle up with transparency and proof',
    description: 'Upload receipts and enable auto-accept in trusted groups.',
  },
];

interface ScreenGradient {
  screenId: number;
  gradient: string[];
}

const ScreenGradients: ScreenGradient[] = [
  { screenId: 0, gradient: ['rgb(248, 181, 133,0.8)', 'rgb(168, 168, 168)'] },
  { screenId: 1, gradient: ['rgb(8, 135, 167,0.8)', 'rgb(168, 168, 168)'] },
  { screenId: 2, gradient: ['rgb(252, 198, 30,0.8)', 'rgb(168, 168, 168)'] },
];

const Onboardings = () => {
  const [index, setIndex] = useState<number>(0);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setIndex(viewableItems[0].index);
      }
    },
  ).current;
  const viewableItemsConfig = { itemVisiblePercentThreshold: 50 };

  return (
    <LinearGradient
      colors={ScreenGradients.find(s => s.screenId === index)?.gradient ?? []}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <FlatList
          horizontal
          data={OnboardingsScreens}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewableItemsConfig}
        />
        <View style={styles.paginator}>
          <Paginator />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'rgba(117, 252, 180, 0.4)',
  },
  gradient: {
    flex: 1,
  },
  paginator: {
    flex: 0.5,
  },
});

export default Onboardings;
