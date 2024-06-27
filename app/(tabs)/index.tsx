import React, { useState, useEffect } from 'react';
import { Appearance, StyleSheet, View, Image, Text, Modal, TouchableOpacity, FlatList, TextInput, Linking, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface Location {
  latitude: number;
  longitude: number;
}

interface GasStation {
  id: number;
  fullName: string;
  gasStationCompanyImageUrl: string;
  fullAddress: string;
  webAddress: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  openDaysString: string;
  openHours: number;
  closeHours: number;
  priceDetails: {
    currentPrice: number;
    oilDerivateType: number;
    oilDerivateName: string;
    history: {
      date: string;
      price: number;
      ascending: boolean;
    }[];
  }[];
  minimumPrices: {
    currentPrice: number;
    oilDerivateType: number;
    oilDerivateName: string;
  }[];
}

interface Municipality {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const getOilTypeShortName = (id: number): string => {
  const oilType = oilTypes.find(type => type.id === id);
  return oilType ? oilType.shortName : '';
};

const oilTypes = [
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

const municipalitiesData: Municipality[] = [
  { id: '1', name: 'Banja Luka', latitude: 44.7725, longitude: 17.191 },
  { id: '3', name: 'Prijedor', latitude: 44.9796, longitude: 16.7039 },
  { id: '4', name: 'Bijeljina', latitude: 44.7566, longitude: 19.2144 },
  { id: '5', name: 'Pale', latitude: 43.8144, longitude: 18.5692 },
  { id: '2135', name: 'Kozarska Dubica', latitude: 45.1768, longitude: 16.8092 },
  { id: '2136', name: 'Mrkonjić Grad', latitude: 44.4153, longitude: 17.0853 },
  { id: '2137', name: 'Gradiška', latitude: 45.1416, longitude: 17.2507 },
  { id: '2138', name: 'Čelinac', latitude: 44.7242, longitude: 17.3242 },
  { id: '2139', name: 'Doboj', latitude: 44.7338, longitude: 18.0845 },
  { id: '2140', name: 'Srbac', latitude: 45.0975, longitude: 17.5256 },
  { id: '2142', name: 'Derventa', latitude: 44.9772, longitude: 17.9106 },
  { id: '2143', name: 'Istočno Sarajevo', latitude: 43.8144, longitude: 18.5692 },
  { id: '2144', name: 'Šipovo', latitude: 44.2825, longitude: 17.0866 },
  { id: '2147', name: 'Istočni Stari Grad', latitude: 43.8029, longitude: 18.3838 },
  { id: '2148', name: 'Trnovo', latitude: 43.6644, longitude: 18.4500 },
  { id: '2149', name: 'Kalinovik', latitude: 43.5583, longitude: 18.4469 },
  { id: '2150', name: 'Sokolac', latitude: 43.9397, longitude: 18.8000 },
  { id: '2151', name: 'Han Pijesak', latitude: 44.0833, longitude: 19.0000 },
  { id: '2152', name: 'Višegrad', latitude: 43.7822, longitude: 19.2856 },
  { id: '2153', name: 'Trebinje', latitude: 42.7111, longitude: 18.3433 },
  { id: '2154', name: 'Bileća', latitude: 42.8719, longitude: 18.4297 },
  { id: '2155', name: 'Gacko', latitude: 43.1669, longitude: 18.5378 },
  { id: '2156', name: 'Nevesinje', latitude: 43.2572, longitude: 18.1136 },
  { id: '2157', name: 'Berkovići', latitude: 43.0997, longitude: 18.2467 },
  { id: '2158', name: 'Ljubinje', latitude: 42.9514, longitude: 18.0883 },
  { id: '2159', name: 'Foča', latitude: 43.5058, longitude: 18.7733 },
  { id: '2160', name: 'Novo Goražde', latitude: 43.6667, longitude: 18.9769 },
  { id: '2161', name: 'Rogatica', latitude: 43.7986, longitude: 19.0014 },
  { id: '2162', name: 'Rudo', latitude: 43.6192, longitude: 19.3669 },
  { id: '2163', name: 'Čajniče', latitude: 43.5569, longitude: 19.0725 },
  { id: '2164', name: 'Ugljevik', latitude: 44.6936, longitude: 19.0089 },
  { id: '2165', name: 'Lopare', latitude: 44.6369, longitude: 18.8519 },
  { id: '2166', name: 'Osmaci', latitude: 44.3878, longitude: 18.9431 },
  { id: '2167', name: 'Bratunac', latitude: 44.1850, longitude: 19.3336 },
  { id: '2168', name: 'Srebrenica', latitude: 44.1069, longitude: 19.2961 },
  { id: '2169', name: 'Vlasenica', latitude: 44.1833, longitude: 18.9411 },
  { id: '2170', name: 'Milići', latitude: 44.1692, longitude: 19.0883 },
  { id: '2171', name: 'Šekovići', latitude: 44.3111, longitude: 18.8572 },
  { id: '2172', name: 'Zvornik', latitude: 44.3850, longitude: 19.1019 },
  { id: '2173', name: 'Prnjavor', latitude: 44.8667, longitude: 17.6622 },
  { id: '2174', name: 'Šamac', latitude: 45.0725, longitude: 18.4633 },
  { id: '2175', name: 'Pelagićevo', latitude: 44.8900, longitude: 18.6064 },
  { id: '2176', name: 'Donji Žabar', latitude: 44.9297, longitude: 18.6356 },
  { id: '2177', name: 'Stanari', latitude: 44.7233, longitude: 18.1156 },
  { id: '2178', name: 'Teslić', latitude: 44.6061, longitude: 17.8592 },
  { id: '2179', name: 'Brod', latitude: 45.1358, longitude: 17.9939 },
  { id: '2180', name: 'Vukosavlje', latitude: 45.0525, longitude: 18.2997 },
  { id: '2181', name: 'Modriča', latitude: 44.9592, longitude: 18.2464 },
  { id: '2182', name: 'Petrovo', latitude: 44.6097, longitude: 18.2878 },
  { id: '2183', name: 'Kotor Varoš', latitude: 44.6228, longitude: 17.3717 },
  { id: '2184', name: 'Kneževo', latitude: 44.4939, longitude: 17.3775 },
  { id: '2185', name: 'Laktaši', latitude: 44.9083, longitude: 17.3000 },
  { id: '2186', name: 'Jezero', latitude: 44.3400, longitude: 17.1911 },
  { id: '2187', name: 'Novo selo (I. Kupres)', latitude: 44.1689, longitude: 17.2486 },
  { id: '2188', name: 'Gornji Ribnik (Ribnik)', latitude: 44.4850, longitude: 16.8058 },
  { id: '2189', name: 'Drinić (Petrovac)', latitude: 44.5233, longitude: 16.6839 },
  { id: '2190', name: 'Potoci (I. Drvar)', latitude: 44.3717, longitude: 16.9378 },
  { id: '2191', name: 'Novi Grad', latitude: 45.0453, longitude: 16.3772 },
  { id: '2192', name: 'Kostajnica', latitude: 45.2272, longitude: 16.5383 },
  { id: '2193', name: 'Donji Dubovik (Krupa na Uni)', latitude: 44.8881, longitude: 16.2881 },
  { id: '2194', name: 'Oštra Luka', latitude: 44.8717, longitude: 16.6447 }
];

export default function TabOneScreen() {
  const initialColorScheme = Appearance.getColorScheme();
  const [colorScheme, setColorScheme] = useState(initialColorScheme);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState('');
  const [filteredMunicipalities, setFilteredMunicipalities] = useState<Municipality[]>(municipalitiesData);
  const [loading, setLoading] = useState(true);
  const [gasStations, setGasStations] = useState<GasStation[]>([]);
  const [selectedGasStation, setSelectedGasStation] = useState<GasStation | null>(null);


  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    const fetchData = async () => {
      try {
        const storedMunicipality = await AsyncStorage.getItem('selectedMunicipality');
        if (storedMunicipality) {
          const parsedMunicipality = JSON.parse(storedMunicipality);
          const municipality = municipalitiesData.find(m => m.id === parsedMunicipality.id);
          if (municipality) {
            setSelectedMunicipality(municipality);
            await fetchGasStations(municipality);
          }
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchData();

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchGasStations = async (municipality: Municipality) => {
    try {
      const gasStationsResponse = await fetch(`https://bps-mtt.vladars.rs:5101/api/gasStationBusinessUnits/city/${municipality.id}/1`);
      const gasStationsData = await gasStationsResponse.json();
      setSelectedLocations(gasStationsData.map((station: GasStation) => ({ latitude: station.latitude, longitude: station.longitude })));
      setGasStations(gasStationsData);
      await AsyncStorage.setItem('selectedMunicipality', JSON.stringify(municipality));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedMunicipality) {
      fetchGasStations(selectedMunicipality);
    }
  }, [selectedMunicipality]);

  useEffect(() => {
    setFilteredMunicipalities(
      municipalitiesData.filter((municipality) =>
        municipality.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const callPhoneNumber = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };

  const renderGasStationDetails = () => (
    <ScrollView>
    <View style={styles.detailsContainer}>
      <TouchableOpacity style={styles.closeIcon} onPress={() => setDetailsModalVisible(false)}>
        <MaterialIcons name="close" size={24} color="#FFF" />
      </TouchableOpacity>
      {selectedGasStation && (
        <>
          <View style={styles.detailsHeader}>
            <Image source={require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/assets/images/benz.jpg')} style={styles.detailsImage} />
            <View style={styles.detailsHeaderText}>
              <Text style={styles.detailsTitle}>{selectedGasStation.fullName}</Text>
              <Text style={styles.detailsAddress}>{selectedGasStation.fullAddress}</Text>
            </View>
          </View>
          <View style={styles.detailsIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => callPhoneNumber(selectedGasStation.phoneNumber)}>
              <MaterialIcons name="phone" size={28} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => openGoogleMaps(selectedGasStation.fullAddress)}>
              <MaterialIcons name="place" size={28} color="#E91E63" />
            </TouchableOpacity>
          </View>
          <View style={styles.workingHoursContainer}>
            <FontAwesome name="clock-o" size={24} color="#FFC107" />
            <Text style={styles.detailsText}>{selectedGasStation.openDaysString} | {selectedGasStation.openHours} - {selectedGasStation.closeHours}</Text>
            
          </View>
          <View style={styles.priceDetails}>
            <Text style={styles.priceDetailsTitle}>Price Details:</Text>
            {selectedGasStation.priceDetails.map((priceDetail, index) => (
              <View key={index} style={styles.priceDetail}>
                <FontAwesome name="tint" size={24} color="#2196F3" />
                <Text style={styles.oilTypeText}>{getOilTypeShortName(priceDetail.oilDerivateType)}</Text>
                <Text style={styles.priceText}>{priceDetail.currentPrice} KM</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
    </ScrollView>
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

  if (loading) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  if (!selectedMunicipality) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colorScheme === 'dark' ? '#333333' : '#FBFCF8' }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.overlayText, { color: colorScheme === 'dark' ? 'white' : '#808080' }]}>Choose your municipality</Text>
          <Image source={require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png')} style={styles.locationIcon} />
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
                        setSelectedMunicipality(item);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={[styles.municipalityText, { color: colorScheme === 'dark' ? 'white' : '#808080' }]}>{item.name}</Text>
                      {selectedMunicipality && selectedMunicipality === item.id && (
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: selectedMunicipality.latitude,
          longitude: selectedMunicipality.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
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
            onPress={() => {
              setSelectedGasStation(gasStations[index]);
              setDetailsModalVisible(true);
            }}
          >
            <Image source={require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png')} style={{ width: 52, height: 52 }} />
          </Marker>
        ))}
      </MapView>
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: colorScheme === 'dark' ? '#333333' : '#FBFCF8' }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.overlayText, { color: colorScheme === 'dark' ? 'white' : '#808080' }]}>
          {selectedMunicipality.name}
        </Text>
        <Image source={require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png')} style={styles.locationIcon} />
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
                      setSelectedMunicipality(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.municipalityText, { color: colorScheme === 'dark' ? 'white' : '#808080' }]}>{item.name}</Text>
                    {selectedMunicipality && selectedMunicipality.id === item.id && (
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
    top: -5,
    right: -5,
 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
