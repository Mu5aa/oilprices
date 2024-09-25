import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, useColorScheme, ScrollView, TouchableOpacity, FlatList,Linking, Modal } from 'react-native';
import { FontAwesome5, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface GasStation {
  id: number;
  fullName: string;
  gasStationCompanyImageUrl: string;
  fullAddress: string;
  phoneNumber: string;
  openDaysString: string;
  openHours: string;
  closeHours: string;
  priceDetails: {
    currentPrice: number | null;
    oilDerivateType: number;
    oilDerivateName: string;
    history: {
      date: string;
      price: number;
    }[];
  }[];
}

interface Municipality {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

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

export default function TabTwoScreen() {
  const [gasStations, setGasStations] = useState<GasStation[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [selectedOilType, setSelectedOilType] = useState<number | null>(null);
  const [isAscending, setIsAscending] = useState(true);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedGasStation, setSelectedGasStation] = useState<GasStation | null>(null);
  const colorScheme = useColorScheme();

  const fetchStoredMunicipality = async () => {
    try {
      const storedMunicipality = await AsyncStorage.getItem('selectedMunicipality');
      if (storedMunicipality) {
        const municipality = JSON.parse(storedMunicipality);
        setSelectedMunicipality(municipality);
        fetchGasStations(municipality.id);
      }
    } catch (error) {
      console.error("Error fetching municipality from AsyncStorage:", error);
    }
  };

  const fetchGasStations = async (municipalityId: string) => {
    try {
      const response = await fetch(`https://bps-mtt.vladars.rs:5101/api/gasStationBusinessUnits/city/${municipalityId}/1`);
      const gasStationsData = await response.json();
      setGasStations(gasStationsData);
    } catch (error) {
      console.error("Error fetching gas stations from API:", error);
      setGasStations([]);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStoredMunicipality();
    }, [])
  );

  useEffect(() => {
    if (selectedMunicipality) {
      fetchGasStations(selectedMunicipality.id);
    }
  }, [selectedMunicipality]);

  const filteredGasStations = selectedOilType !== null 
    ? gasStations.filter(gasStation => gasStation.priceDetails.some(detail => detail.oilDerivateType === selectedOilType)) 
    : gasStations;

  const sortGasStations = () => {
    const sortedGasStations = [...filteredGasStations].sort((a, b) => {
      const priceA = a.priceDetails.find(detail => detail.oilDerivateType === selectedOilType)?.currentPrice ?? 0;
      const priceB = b.priceDetails.find(detail => detail.oilDerivateType === selectedOilType)?.currentPrice ?? 0;
      return isAscending ? priceA - priceB : priceB - priceA;
    });
    setGasStations(sortedGasStations);
  };

  useEffect(() => {
    sortGasStations();
  }, [isAscending, selectedOilType]);

  const handleOilTypeSelection = (oilTypeId: number) => {
    setSelectedOilType(oilTypeId);
    if (selectedMunicipality) {
      fetchGasStations(selectedMunicipality.id);
    }
  };

  const handleGasStationPress = (gasStation: GasStation) => {
    setSelectedGasStation(gasStation);
    setDetailsModalVisible(true);
  };

  const getOilTypeShortName = (oilTypeId: number) => {
    const oilType = oilTypes.find(type => type.id === oilTypeId);
    return oilType ? oilType.shortName : '';
  };

  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const callPhoneNumber = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#f0f0f0' }]}>
      <FlatList 
        data={oilTypes}
        horizontal
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.oilTypeButton, 
              { backgroundColor: selectedOilType === item.id ? '#ffa726' : colorScheme === 'dark' ? '#333' : '#fff' }
            ]}
            onPress={() => handleOilTypeSelection(item.id)}
          >
            <Text style={{ color: selectedOilType === item.id ? '#fff' : colorScheme === 'dark' ? '#fff' : '#000' }}>{item.shortName}</Text>
          </TouchableOpacity>
        )}
        style={styles.oilTypeList}
        showsHorizontalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.sortButton} onPress={() => setIsAscending(!isAscending)}>
        <Text style={styles.sortButtonText}>{isAscending ? 'Sort Descending' : 'Sort Ascending'}</Text>
      </TouchableOpacity>

      {filteredGasStations.length === 0 ? (
        <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000', marginBottom: 10 }}>No gas stations available</Text>
      ) : null}

      <ScrollView>
        {filteredGasStations.map(gasStation => {
          const relevantDetails = gasStation.priceDetails.filter(detail => detail.oilDerivateType === selectedOilType);
          return relevantDetails.map((detail, index) => (
            <TouchableOpacity key={`${gasStation.id}-${detail.oilDerivateType}-${index}`} onPress={() => handleGasStationPress(gasStation)}>
              <View style={[styles.gasStationContainer, { backgroundColor: colorScheme === 'dark' ? '#2c2c2c' : '#fff' }]}>
                <View style={styles.logoContainer}>
                <Image source={require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/assets/images/benz.jpg')} style={styles.detailsImage} />
                </View>
                <View style={styles.infoContainer}>
                  <Text style={[styles.name, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{gasStation.fullName}</Text>
                  <Text style={[styles.address, { color: colorScheme === 'dark' ? '#ddd' : '#555' }]}>{gasStation.fullAddress}</Text>
                </View>
                {detail.currentPrice !== null && (
                  <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                      {detail.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} KM
                    </Text>
                    {detail.history && detail.history.length > 0 && (
                      <View style={styles.arrowContainer}>
                        {detail.currentPrice > detail.history[0].price ? (
                          <>
                            <Text style={[styles.changeText,{ color: colorScheme === 'dark' ? 'green' : 'green'}]}>+{(detail.currentPrice - detail.history[0].price).toFixed(2)}</Text>
                            <FontAwesome5 name="caret-up" size={20} color="green" style={{ marginLeft: 5 }} />
                          </>
                        ) : (
                          <>
                            <Text style={[styles.changeText,{ color: colorScheme === 'dark' ? 'red' : 'red'}]}>{(detail.currentPrice - detail.history[0].price).toFixed(2)}</Text>
                            <FontAwesome5 name="caret-down" size={20} color="red" style={{ marginLeft: 5 }} />
                          </>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ));
        })}
      </ScrollView>

      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.detailsModalContainer}>
          <View style={[styles.detailsModalView,{ backgroundColor: colorScheme === 'dark' ? '#333333' : '#FBFCF8' }]}>
          <ScrollView>
    <View style={styles.detailsContainer}>
      <TouchableOpacity style={styles.closeIcon} onPress={() => setDetailsModalVisible(false)}>
        <MaterialIcons name="close" size={24} color={colorScheme === 'dark' ? '#FFF' : '#000'}/>
      </TouchableOpacity>
      {selectedGasStation && (
        <>
          <View style={styles.detailsHeader}>
            <Image source={require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/assets/images/benz.jpg')} style={styles.detailsImage} />
            <View style={[styles.detailsHeaderText]}>
              <Text style={[styles.detailsTitle,{ color: colorScheme === 'dark' ? 'white' : '#000' }]}>{selectedGasStation.fullName}</Text>
              <Text style={[styles.detailsAddress,{ color: colorScheme === 'dark' ? '#AAA' : '#808080' }]}>{selectedGasStation.fullAddress}</Text>
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
          <View style={[styles.workingHoursContainer,{ backgroundColor: colorScheme === 'dark' ? '#444' : '#41424c' }]}>
            <FontAwesome name="clock-o" size={24} color="#FFC107" />
            <Text style={styles.detailsText}>{selectedGasStation.openDaysString} | {selectedGasStation.openHours} - {selectedGasStation.closeHours}</Text>
            
          </View>
          <View style={styles.priceDetails}>
            <Text style={styles.priceDetailsTitle}>Price Details:</Text>
            {selectedGasStation.priceDetails.map((priceDetail, index) => (
              <View key={index} style={[styles.priceDetail,{ backgroundColor: colorScheme === 'dark' ? '#444' : '#41424c' }]}>
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
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  oilTypeList: {
    marginBottom: 10,
  },
  oilTypeButton: {
    width: 100,
    height: 40,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    marginBottom: 12,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sortButton: {
    padding: 10,
    backgroundColor: '#ffa726',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  sortButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  gasStationContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoContainer: {
    marginRight: 15,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    marginTop: 5,
  },
  priceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 20,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  changeText: {
    fontSize: 16,
    marginRight: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: '90%',
    height: '80%',
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
