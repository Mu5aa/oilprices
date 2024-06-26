import React, { useState, useEffect } from 'react';
import { Appearance, StyleSheet, View, Image, Text, Modal, TouchableOpacity, FlatList, TextInput, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

interface Location {
  latitude: number;
  longitude: number;
}

interface GasStations {
  [key: string]: Location[];
}

const municipalities = [
  { id: '1', name: 'Municipality 1' },
  { id: '2', name: 'Municipality 2' },
  { id: '3', name: 'Municipality 3' },
  // Add more municipalities as needed
];

const gasStations: GasStations = {
  '1': [
    { latitude: 43.961235763484915, longitude: 18.05658163617972 },
    { latitude: 43.97042427861928, longitude: 18.053852547010756 },
  ],
  '2': [
    { latitude: 43.97273319661385, longitude: 18.05162396098856 },
    { latitude: 43.97560604005778, longitude: 18.05007164364737 },
  ],
  '3': [
    { latitude: 43.97522980892014, longitude: 18.049259588155618 },
  ],
};

// Example data for gas station details
const gasStationDetails = {
  id: 1095,
  fullName: "Krajina Petrol - Krajina Petrol-P.J.  Banja Luka 1",
  gasStationCompanyImageUrl: "https://via.placeholder.com/100",
  fullAddress: "Knjaza Miloša 14, Banja Luka",
  webAddress: "https://krajinapetrol.com/",
  phoneNumber: "051/329-960",
  latitude: 44.793925002,
  longitude: 17.207018884,
  openDaysString: "PON - NED",
  openHours: 6,
  closeHours: 24,
  priceDetails: [
    {
      currentPrice: 1.62,
      oilDerivateType: 4,
      oilDerivateName: "EURODIZEL BAS EN590 KONZULATI SR _ HR",
      history: []
    },
    {
      currentPrice: 2.61,
      oilDerivateType: 2,
      oilDerivateName: "PREMIUM 95 BAS EN 228",
      history: [
        {
          date: "2024-04-19T08:23:25.2066667",
          price: 2.69,
          ascending: true
        },
        {
          date: "2024-02-21T02:50:08.01",
          price: 2.61,
          ascending: true
        },
        {
          date: "2024-02-13T02:50:06.24",
          price: 2.53,
          ascending: true
        }
      ]
    },
  ],
  minimumPrices: [
    {
      currentPrice: 1.62,
      oilDerivateType: 4,
      oilDerivateName: "EURODIZEL BAS EN590 KONZULATI SR _ HR"
    },
    {
      currentPrice: 2.61,
      oilDerivateType: 2,
      oilDerivateName: "PREMIUM 95 BAS EN 228"
    },
    {
      currentPrice: 2.51,
      oilDerivateType: 2048,
      oilDerivateName: "DIZEL GORIVO BAS EN 590"
    },
    {
      currentPrice: 1.15,
      oilDerivateType: 2041,
      oilDerivateName: "TECNI NAFTNI GAS BAS EN 589"
    },
    {
      currentPrice: 2.51,
      oilDerivateType: 4,
      oilDerivateName: "DIZEL GORIVO BAS EN 590"
    },
    {
      currentPrice: 2.61,
      oilDerivateType: 2,
      oilDerivateName: "PREMIUM 95 BAS EN 228"
    }
  ]
};

interface OilType {
  id: number;
  name: string;
  shortName: string;
}

const oilTypes: OilType[] = [
  {
    id: 2,
    name: "Premium bezolovni benzin 95",
    shortName: "BMB 95"
  },
  {
    id: 3,
    name: "SUPER PLUS bezolovni benzin 98 BAS EN 228",
    shortName: "SUPER 98"
  },
  {
    id: 4,
    name: "Dizel EURO 5",
    shortName: "EUD5"
  },
  {
    id: 1002,
    name: "Dizel Euro 5 Aditivirani",
    shortName: "EUD5+"
  },
  {
    id: 2041,
    name: "Tečni naftni gas",
    shortName: "TNG"
  },
  {
    id: 2042,
    name: "AD BLUE",
    shortName: "ADB"
  },
  {
    id: 2043,
    name: "Lož ulje",
    shortName: "LU"
  },
  {
    id: 2044,
    name: " SUPER  bezolovni benzin 100 BAS EN 228",
    shortName: "SUPER 100"
  },
  {
    id: 2045,
    name: "Dizel EURO 6",
    shortName: "EUD6"
  },
  {
    id: 2046,
    name: "Dizel EURO 4",
    shortName: "EUD4"
  },
  {
    id: 2047,
    name: "Premium bezolovni benzin 95 Aditivirani",
    shortName: "BMB95+"
  },
  {
    id: 2048,
    name: "Konzularni Dizel",
    shortName: "DKON"
  }
];

const getOilTypeShortName = (id: number): string => {
  const oilType = oilTypes.find(type => type.id === id);
  return oilType ? oilType.shortName : '';
};

export default function TabOneScreen() {
  const initialColorScheme = Appearance.getColorScheme();
  const [colorScheme, setColorScheme] = useState(initialColorScheme);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState('');
  const [filteredMunicipalities, setFilteredMunicipalities] = useState(municipalities);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (selectedMunicipality) {
      setSelectedLocations(gasStations[selectedMunicipality]);
    }
  }, [selectedMunicipality]);

  useEffect(() => {
    setFilteredMunicipalities(
      municipalities.filter((municipality) =>
        municipality.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  const kiseljakCoordinates = {
    latitude: 43.9426,
    longitude: 18.0763,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const customMarker = require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png');
  const locationIcon = require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png');

  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const callPhoneNumber = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };

  const renderGasStationDetails = () => (
    <View style={styles.detailsContainer}>
      <TouchableOpacity style={styles.closeIcon} onPress={() => setDetailsModalVisible(false)}>
        <MaterialIcons name="close" size={24} color="#FFF" />
      </TouchableOpacity>
      <View style={styles.detailsHeader}>
        <Image source={{ uri: gasStationDetails.gasStationCompanyImageUrl }} style={styles.detailsImage} />
        <View style={styles.detailsHeaderText}>
          <Text style={styles.detailsTitle}>{gasStationDetails.fullName}</Text>
          <Text style={styles.detailsAddress}>{gasStationDetails.fullAddress}</Text>
        </View>
      </View>
      <View style={styles.detailsIcons}>
        <TouchableOpacity style={styles.iconButton} onPress={() => callPhoneNumber(gasStationDetails.phoneNumber)}>
          <MaterialIcons name="phone" size={28} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => openGoogleMaps(gasStationDetails.fullAddress)}>
          <MaterialIcons name="place" size={28} color="#E91E63" />
        </TouchableOpacity>
      </View>
      <View style={styles.workingHoursContainer}>
        <FontAwesome name="clock-o" size={24} color="#FFC107" />
        <Text style={styles.detailsText}>{gasStationDetails.openDaysString} {gasStationDetails.openHours} - {gasStationDetails.closeHours}</Text>
      </View>
      <View style={styles.priceDetails}>
        <Text style={styles.priceDetailsTitle}>Price Details:</Text>
        {gasStationDetails.priceDetails.map((priceDetail, index) => (
          <View key={index} style={styles.priceDetail}>
            <FontAwesome name="tint" size={24} color="#2196F3" />
            <Text style={styles.oilTypeText}>{getOilTypeShortName(priceDetail.oilDerivateType)}</Text>
            <Text style={styles.priceText}>{priceDetail.currentPrice} KM</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderGasStationDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={detailsModalVisible}
      onRequestClose={() => setDetailsModalVisible(false)}
    >
      <View style={styles.detailsModalContainer}>
        <View style={[styles.detailsModalView, { backgroundColor: colorScheme === 'dark' ? '#333333' : '#FBFCF8' }]}>
          {renderGasStationDetails()}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={kiseljakCoordinates}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomControlEnabled={true}
        loadingEnabled={true}
        showsCompass={true}
        showsTraffic={false}
        rotateEnabled={true}
        customMapStyle={colorScheme === 'dark' ? darkType : []}
      >
        {selectedLocations.map((location, index) => (
          <Marker
            key={index}
            coordinate={location}
            onPress={() => setDetailsModalVisible(true)}
          >
            <Image source={customMarker} style={{ width: 52, height: 52 }} />
          </Marker>
        ))}
      </MapView>
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: colorScheme === 'dark' ? '#333333' : '#FBFCF8' }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.overlayText, { color: colorScheme === 'dark' ? 'white' : '#808080' }]}>Kiseljak</Text>
        <Image source={locationIcon} style={styles.locationIcon} />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalView, { backgroundColor: colorScheme === 'dark' ? '#333333' : '#FBFCF8' }]}>
            <Text style={[styles.modalText, { color: colorScheme === 'dark' ? 'white' : '#808080' }]}>Select Municipality</Text>
            <TextInput
              style={styles.searchBar}
              placeholder="Search"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#333'}
              value={search}
              onChangeText={setSearch}
            />
            <View style={styles.listContainer}>
              <FlatList
                data={filteredMunicipalities}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.municipalityButton, { borderColor: colorScheme === 'dark' ? '#555555' : '#ccc' }]}
                    onPress={() => {
                      setSelectedMunicipality(item.id);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.municipalityText, { color: colorScheme === 'dark' ? 'white' : '#808080' }]}>{item.name}</Text>
                    {selectedMunicipality === item.id && (
                      <MaterialIcons name="check" size={24} color="white" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {renderGasStationDetailsModal()}
    </View>
  );
}

const darkType = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#263c3f"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6b9a76"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#38414e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#212a37"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9ca5b3"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1f2835"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#f3d19c"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2f3948"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#515c6d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  }
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 65,
    left: 20,
    right: 20,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E9E8E8',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  overlayText: {
    fontSize: 30,
    flex: 1,
    fontFamily: 'Avenir-Book',
    textAlign: 'center',
  },
  locationIcon: {
    width: 32,
    height: 32,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: '90%',
    height: '80%', // Make the modal taller
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
  },
  searchBar: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: 'white',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  municipalityButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    backgroundColor: '#A9A9A9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  municipalityText: {
    fontSize: 18,
    color: 'white',
  },
  checkmark: {
    fontSize: 18,
    color: 'white',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#A9A9A9',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    padding: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailsImage: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 10,
  },
  detailsHeaderText: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  detailsAddress: {
    fontSize: 16,
    color: '#AAA',
  },
  detailsIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  iconButton: {
    marginHorizontal: 15,
  },
  detailsText: {
    fontSize: 17,
    color: '#FFF',
    marginLeft: 40,
    fontWeight: 'bold',
  },
  priceDetails: {
    marginTop: 15,
    width: '100%',
  },
  priceDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 10,
  },
  priceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 10,
  },
  priceIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  oilTypeText: {
    flex: 1,
    fontSize: 17,
    color: '#FFF',
    left: 10,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  workingHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 10,
    width: '100%',
  },
  detailsModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsModalView: {
    width: '90%',
    height: '70%',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
