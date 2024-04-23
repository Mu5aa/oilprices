import React from 'react';
import { StyleSheet, View, useColorScheme, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface Props {}

const OilPriceChart: React.FC<Props> = () => {
  const colorScheme = useColorScheme();
  
  // Define chart background colors based on color scheme
  const backgroundColorLight = '#ffffff';
  const backgroundColorDark = '#000000';

  // Define label color function based on color scheme
  const getLabelColor = (opacity: number) => {
    return colorScheme === 'light' ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`;
  };

  const gasPrices = [30, 35, 40, 38, 36, 32, 28];
  const dieselPrices = [25, 28, 30, 29, 27, 26, 24];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = 300; // Set a fixed height for the chart

  const chartConfig = {
    backgroundGradientFrom: colorScheme === 'light' ? backgroundColorLight : backgroundColorDark,
    backgroundGradientTo: colorScheme === 'light' ? backgroundColorLight : backgroundColorDark,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Font color
    labelColor: getLabelColor,
    propsForDots: {
      r: '5', // Dot size
      strokeWidth: '2', // Dot border width
      stroke: '#ffa726', // Dot border color
    },
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: daysOfWeek,
          datasets: [
            {
              data: gasPrices,
              color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
              strokeWidth: 2,
            },
            {
              data: dieselPrices,
              color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        }}
        width={screenWidth}
        height={screenHeight}
        yAxisLabel="$"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withVerticalLines={false} // Remove vertical grid lines
        withHorizontalLines={true} // Add horizontal grid lines
        withDots={true} // Show data points
        verticalLabelRotation={50} // Rotate vertical labels for better visibility
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chart: {
    borderRadius: 0,
  },
});

export default OilPriceChart;
