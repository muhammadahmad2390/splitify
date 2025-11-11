import RightArrow from '@/assets/SVG/RigthArrow';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';

const NextButton = () => {
  return (
    <TouchableOpacity style={styles.button}>
      <RightArrow width={34} height={34} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(42, 42, 42, 0.4)',
    padding: 12,
    borderRadius: '50%',
  },
});

export default NextButton;
