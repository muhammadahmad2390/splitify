import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ViewToken,
  Animated,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import OnboardingItem from '@/components/molecules/OnboardingItem';
import { OnboardingItemsProps } from '@/types/Onboarding';
import { useRef, useState } from 'react';
import Paginator from '@/components/molecules/Paginator';
const { width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export const OnboardingsScreens: OnboardingItemsProps[] = [
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
  const Slide = useRef<FlatList<OnboardingItemsProps>>(null);
  const ScrollX = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();

  const ScrollTo = async () => {
    if (index < OnboardingsScreens.length - 1) {
      Slide.current?.scrollToIndex({ index: index + 1 });
    } else {
      try {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        navigation.navigate('Auth');
      } catch (e) {
        console.log('Error saving onboarding to async storage :', e);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {ScreenGradients.map(sg => {
        const inputRange = [
          (sg.screenId - 1) * width,
          sg.screenId * width,
          (sg.screenId + 1) * width,
        ];
        const opacity = ScrollX.interpolate({
          inputRange,
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={sg.screenId}
            style={[styles.gradientContainer, { opacity }]}
          >
            <LinearGradient
              colors={sg.gradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.gradient}
            />
          </Animated.View>
        );
      })}

      <View style={styles.container}>
        <Animated.FlatList
          horizontal
          data={OnboardingsScreens}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewableItemsConfig}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: ScrollX } } }],
            { useNativeDriver: false },
          )}
          ref={Slide}
        />
        <View style={styles.paginator}>
          <Paginator
            ScrollX={ScrollX}
            slide={Slide}
            slideIndex={index}
            scrollTo={ScrollTo}
          />
        </View>
      </View>
    </View>
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
  gradientContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  paginator: {
    flex: 0.8,
  },
});

export default Onboardings;
