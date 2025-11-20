import RightArrow from '@/assets/SVG/RigthArrow';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { OnboardingsScreens } from '@/screens/Onboardings';

const NextButton = ({
  scrollTo,
  slideIndex,
}: {
  scrollTo: () => void;
  slideIndex: number;
}) => {
  const isLast = slideIndex === OnboardingsScreens.length - 1;

  const width = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLast) {
      Animated.parallel([
        Animated.timing(width, {
          toValue: 120,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          delay: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(width, {
          toValue: 60,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [slideIndex]);

  return (
    <TouchableOpacity
      onPress={() => {
        scrollTo();
      }}
    >
      <Animated.View style={[styles.button, { width }]}>
        {slideIndex < OnboardingsScreens.length - 1 ? (
          <RightArrow width={34} height={34} />
        ) : (
          <Animated.Text style={[styles.buttonText, { opacity }]}>
            Get started
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgb(1, 72, 101)',
    padding: 12,
    height: 60,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default NextButton;
