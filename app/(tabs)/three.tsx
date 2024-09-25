import React from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const darkChartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#08130D",
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White for lines
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 2, // optional, defaults to 2dp
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White for labels
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#ffa726"
  }
};

const lightChartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#ffffff",
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black for lines
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 2, // optional, defaults to 2dp
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black for labels
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#ffa726"
  }
};

const fuelTypes = [
  { id: 2, name: "Premium bezolovni benzin 95", shortName: "BMB 95" },
  { id: 3, name: "SUPER PLUS bezolovni benzin 98 BAS EN 228", shortName: "SUPER 98" },
  { id: 4, name: "Dizel EURO 5", shortName: "EUD5" },
  { id: 1002, name: "Dizel Euro 5 Aditivirani", shortName: "EUD5+" },
  { id: 2041, name: "Tečni naftni gas", shortName: "TNG" },
  { id: 2042, name: "AD BLUE", shortName: "ADB" },
  { id: 2043, name: "Lož ulje", shortName: "LU" },
  { id: 2044, name: "SUPER bezolovni benzin 100 BAS EN 228", shortName: "SUPER 100" },
  { id: 2045, name: "Dizel EURO 6", shortName: "EUD6" },
  { id: 2046, name: "Dizel EURO 4", shortName: "EUD4" },
  { id: 2047, name: "Premium bezolovni benzin 95 Aditivirani", shortName: "BMB95+" },
  { id: 2048, name: "Konzularni Dizel", shortName: "DKON" }
];

const Three: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [data, setData] = React.useState<number[]>([]);
  const [labels, setLabels] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedFuelType, setSelectedFuelType] = React.useState<number>(2); // Default to Premium bezolovni benzin 95

  const loadData = async (fuelType: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://bps-mtt.vladars.rs:5101/api/gasStationBusinessUnits/city/3/1`);
      if (!response.data || !response.data.length) {
        throw new Error("Empty response or invalid data format");
      }
      const fuelData = response.data[0].priceDetails.find((detail: any) => detail.oilDerivateType === fuelType);
      if (!fuelData || !fuelData.history || !fuelData.history.length) {
        throw new Error("Invalid fuel data or history not available");
      }
      const prices = fuelData.history.map((entry: any) => entry.price);
      const dates = fuelData.history.map((entry: any) => new Date(entry.date).toLocaleDateString("en-GB"));

      // Reverse both arrays to display from oldest to newest
      const reversedPrices = prices.reverse();
      const reversedDates = dates.reverse();

      // Keep only key dates to avoid clutter
      const spacedDates = reversedDates.filter((_: any, index: any) => index % Math.ceil(reversedDates.length / 5) === 0);

      setData(reversedPrices);
      setLabels(spacedDates);
    } catch (error) {
      console.error("Failed to fetch data:");
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData(selectedFuelType);
  }, [selectedFuelType]);

  const oilPriceData = {
    labels: labels,
    datasets: [
      {
        data: data,
        color: (opacity: number = 1) => `rgba(0, 123, 255, ${opacity})`, // Blue
        strokeWidth: 2,
      },
    ],
    legend: ["Oil Prices"] // Legend for the chart
  };

  const handleFuelTypePress = (fuelId: number) => {
    console.log("Fuel type selected:", fuelId);
    setSelectedFuelType(fuelId);
  };

  return (
    <View style={isDarkMode ? darkStyles.container : lightStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={isDarkMode ? darkStyles.categoryContainer : lightStyles.categoryContainer}
      >
        {fuelTypes.map((fuel) => (
          <TouchableOpacity 
            key={fuel.id}
            style={[
              isDarkMode ? darkStyles.categoryItem : lightStyles.categoryItem, 
              selectedFuelType === fuel.id && (isDarkMode ? darkStyles.selected : lightStyles.selected)
            ]}
            onPress={() => handleFuelTypePress(fuel.id)}
            testID={`fuel-button-${fuel.id}`}
          >
            <Text style={isDarkMode ? darkStyles.categoryText : lightStyles.categoryText}>{fuel.shortName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading ? (
        <ActivityIndicator size="large" color={isDarkMode ? "#ffffff" : "#000000"} testID="loading-indicator" />
      ) : error ? (
        <Text style={isDarkMode ? darkStyles.error : lightStyles.error} testID="error-message">{error}</Text>
      ) : (
        <View testID="line-chart-container">
          <LineChart
            data={oilPriceData}
            width={screenWidth}
            height={screenHeight * 0.58} // Adjusted height to take up half of the screen
            chartConfig={isDarkMode ? darkChartConfig : lightChartConfig}
            bezier
            style={isDarkMode ? darkStyles.chart : lightStyles.chart}
          />
        </View>
      )}
    </View>
  );
};

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff', // White text
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  categoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#333',
  },
  categoryText: {
    color: 'white',
    fontSize: 16,
  },
  selected: {
    backgroundColor: '#ffa726',
    borderWidth: 1,
    borderColor: '#ffa726',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  error: {
    color: 'red',
    fontSize: 18,
    marginTop: 10,
  }
});

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Light background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000', // Black text
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  categoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#e0e0e0',
  },
  categoryText: {
    color: 'black',
    fontSize: 16,
  },
  selected: {
    backgroundColor: '#ffa726',
    borderWidth: 1,
    borderColor: '#ffa726',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  error: {
    color: 'red',
    fontSize: 18,
    marginTop: 10,
  }
});

export default Three;
