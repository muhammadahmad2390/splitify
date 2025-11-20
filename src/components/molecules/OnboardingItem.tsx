import { View, Text, Image, Dimensions, StyleSheet } from 'react-native';
import { OnboardingItemsProps } from '@/types/Onboarding';

const OnboardingItem = ({ item }: { item: OnboardingItemsProps }) => {
  const { width, height } = Dimensions.get('window');
  return (
    <View style={[styles.container, { width }]}>
      <View>
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image
          style={[{ width, height: height * 0.5 }, styles.image]}
          source={item.img}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // borderWidth: 3,
    // borderColor: 'red',
    justifyContent: 'center',
    marginVertical: 50,
  },
  imageContainer: {
    // borderWidth: 5,
    // borderColor: 'yellow',
    alignSelf: 'center',
  },

  textContainer: {
    // borderWidth: 3,
    // borderColor: 'green',
  },
  image: {
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
  },
});

export default OnboardingItem;
