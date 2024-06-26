import React from 'react';
import { StyleSheet, View, Text, Image, useColorScheme } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';


export default function TabTwoScreen() {

  const gasStations = [
    { id: 1, name: 'Gas Station 1', address: 'Address 1', logo: require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png'), price: '2.50', previousPrice: '2.40' },
    { id: 2, name: 'Gas Station 2', address: 'Address 2', logo: require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png'), price: '2.60', previousPrice: '2.65' },
    { id: 3, name: 'Gas Station 2', address: 'Address 2', logo: require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png'), price: '2.60', previousPrice: '2.65' },
    { id: 4, name: 'Gas Station 2', address: 'Address 2', logo: require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png'), price: '2.60', previousPrice: '2.65' },
    { id: 5, name: 'Gas Station 2', address: 'Address 2', logo: require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png'), price: '2.60', previousPrice: '2.65' },
    { id: 6, name: 'Gas Station 2', address: 'Address 2', logo: require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png'), price: '2.60', previousPrice: '2.65' },

  ];

  const colorScheme = useColorScheme();

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}>
      {gasStations.map(gasStation => (
        <View key={gasStation.id} style={[styles.gasStationContainer, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }]}>
          <View style={styles.logoContainer}>
            <Image source={gasStation.logo} style={styles.logo} />
          </View>
          <View style={styles.infoContainer}>
            <Text style={[styles.name, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{gasStation.name}</Text>
            <Text style={[styles.address, { color: colorScheme === 'dark' ? '#ddd' : '#555' }]}>{gasStation.address}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              {parseFloat(gasStation.price).toLocaleString('en-US', { minimumFractionDigits: 2 })} KM
            </Text>

          </View>
          <View style={styles.arrowContainer}>
              {parseFloat(gasStation.price) > parseFloat(gasStation.previousPrice) ? (
                <>
                  <Text style={styles.changeText}>+{(parseFloat(gasStation.price) - parseFloat(gasStation.previousPrice)).toFixed(2)}</Text>
                  <FontAwesome5 name="caret-up" size={20} color="green" style={{ marginLeft: 5 }} />
                </>
              ) : (
                <>
                  <Text style={styles.changeText}>{(parseFloat(gasStation.price) - parseFloat(gasStation.previousPrice)).toFixed(2)}</Text>
                  <FontAwesome5 name="caret-down" size={20} color="red" style={{ marginLeft: 5 }} />
                </>
              )}
            </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  gasStationContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoContainer: {
    marginRight: 10,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  changeText: {
    fontSize: 16,
    marginRight: 5,
  },
});
