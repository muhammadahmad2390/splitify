import { Text, View, StyleSheet } from 'react-native';
import NextButton from '@/components/atoms/NextButton';

const Paginator = () => {
  return (
    <View style={styles.container}>
      <Text>Dots</Text>
      <NextButton />
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
