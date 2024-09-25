import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Modal, useColorScheme, Linking, ScrollView, FlatList, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import { FontAwesome5, MaterialIcons, FontAwesome } from '@expo/vector-icons';


interface PriceDetail {
  currentPrice: number | null;
  oilDerivateType: number;
}


interface GasStation {
  id: number;
  fullName: string;
  fullAddress: string;
  priceDetails: PriceDetail[];
  phoneNumber: string;
}

interface GasStationWithPrice extends GasStation {
  totalPrice: number;
}

interface Municipality {
  id: string;
  name: string;
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

export default function FourScreen() {
  const [tankSize, setTankSize] = useState<string>('');
  const [selectedOilType, setSelectedOilType] = useState<number>(oilTypes[0].id);
  const [cheapestGasStation, setCheapestGasStation] = useState<GasStationWithPrice | null>(null);
  const [gasStations, setGasStations] = useState<GasStation[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedCards, setScannedCards] = useState<ScannedCard[]>([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showOilTypeModal, setShowOilTypeModal] = useState<boolean>(false);
  const [selectedQRCode, setSelectedQRCode] = useState<string | null>(null); // New state for displaying selected QR code
  const colorScheme = useColorScheme();
  const [scannedCardNames, setScannedCardNames] = useState<string[]>([]);
  const [cardNameInput, setCardNameInput] = useState<string>('');
  const [isCardNamed, setIsCardNamed] = useState<boolean>(false);
  const [cardName, setCardName] = useState<string>('');
  
  



  type ScannedCard = {
    name: string;
    data: string;
  };
  

  const fetchStoredMunicipality = useCallback(async () => {
    try {
      const storedMunicipality = await AsyncStorage.getItem('selectedMunicipality');
      if (storedMunicipality) {
        const municipality = JSON.parse(storedMunicipality);
        setSelectedMunicipality(municipality);
      }
    } catch (error) {
      console.error("Error fetching municipality from AsyncStorage:", error);
    }
  }, []);

  const fetchGasStations = useCallback(async (municipalityId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://bps-mtt.vladars.rs:5101/api/gasStationBusinessUnits/city/${municipalityId}/1`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const gasStationsData = await response.json();
      setGasStations(gasStationsData);
    } catch (error) {
      console.error("Error fetching gas stations from API:", error);
      setGasStations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStoredMunicipality();
    }, [fetchStoredMunicipality])
  );

  useEffect(() => {
    if (selectedMunicipality) {
      fetchGasStations(selectedMunicipality.id);
    }
  }, [selectedMunicipality, fetchGasStations]);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const loadScannedCards = async () => {
        try {
            const storedCards = await AsyncStorage.getItem('scannedCards');
            const storedCardNames = await AsyncStorage.getItem('scannedCardNames');
            if (storedCards) {
                setScannedCards(JSON.parse(storedCards));
            }
            if (storedCardNames) {
                setScannedCardNames(JSON.parse(storedCardNames));
            }
        } catch (error) {
            console.error("Error loading scanned cards from AsyncStorage:", error);
        }
    };
    loadScannedCards();
}, []);


  const calculateCheapestGasStation = () => {
    if (tankSize && gasStations.length > 0) {
      const gasStationWithPrice: GasStationWithPrice[] = gasStations.map(station => {
        const priceDetail = station.priceDetails.find(detail => detail.oilDerivateType === selectedOilType);
        if (priceDetail && priceDetail.currentPrice !== null) {
          return {
            ...station,
            totalPrice: priceDetail.currentPrice * parseFloat(tankSize)
          };
        }
        return null;
      }).filter(station => station !== null) as GasStationWithPrice[];

      if (gasStationWithPrice.length > 0) {
        const cheapestStation = gasStationWithPrice.reduce((prev, curr) => {
          if (!prev) return curr;
          if (!curr) return prev;
          return prev.totalPrice < curr.totalPrice ? prev : curr;
        }, gasStationWithPrice[0]);
        setCheapestGasStation(cheapestStation);
      }
    }
  };

  const handleSaveCardName = async () => {
    const newScannedCards = scannedCards.map(card => 
      card.data === selectedQRCode ? { ...card, name: cardName } : card
    );
    setScannedCards(newScannedCards);
    try {
      await AsyncStorage.setItem('scannedCards', JSON.stringify(newScannedCards));
    } catch (error) {
      console.error("Error saving card name to AsyncStorage:", error);
    }
    setSelectedQRCode(null); // Close the modal
    setCardName(''); // Reset the card name input
  };

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    const newScannedCards: ScannedCard[] = [...scannedCards, { name: cardName, data }];
    setScannedCards(newScannedCards);
    setScannerVisible(false);
    try {
      await AsyncStorage.setItem('scannedCards', JSON.stringify(newScannedCards));
    } catch (error) {
      console.error("Error saving scanned card to AsyncStorage:", error);
    }
    setIsCardNamed(false);
    setCardName('');
  };
  

  const handleDeleteCard = async (index: number) => {
    const newScannedCards = scannedCards.filter((_, i) => i !== index);
    
    setScannedCards(newScannedCards);
    
    try {
        await AsyncStorage.setItem('scannedCards', JSON.stringify(newScannedCards));
    } catch (error) {
        console.error("Error deleting scanned card from AsyncStorage:", error);
    }
  };
  


// Make sure to structure `scannedCards` like this: [{ name: 'Card 1', data: 'Data 1' }, { name: 'Card 2', data: 'Data 2' }]


  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const callPhoneNumber = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url);
  };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#f0f0f0' }]}>
    <ScrollView showsVerticalScrollIndicator={false}>

      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Fuel Cost Calculator</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff', color: colorScheme === 'dark' ? '#fff' : '#000' }]}
        placeholder="Enter tank size in liters"
        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#555'}
        keyboardType="numeric"
        value={tankSize}
        onChangeText={setTankSize}
      />
      <TouchableOpacity
        style={[styles.oilTypeButton, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}
        onPress={() => setShowOilTypeModal(true)}
      >
        <Text style={[styles.oilTypeText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          {oilTypes.find(oil => oil.id === selectedOilType)?.shortName}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.calculateButton} onPress={calculateCheapestGasStation}>
        <Text style={styles.calculateButtonText}>Calculate Cheapest Gas Station</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#000'} />}
      {cheapestGasStation && (
        <TouchableOpacity style={[styles.resultContainer, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]} onPress={() => setModalVisible(true)}>
          <Text style={[styles.resultText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Cheapest Gas Station</Text>
          <Text style={[styles.resultDetail, { color: colorScheme === 'dark' ? '#ddd' : '#555' }]}>Name: {cheapestGasStation.fullName}</Text>
          <Text style={[styles.resultDetail, { color: colorScheme === 'dark' ? '#ddd' : '#555' }]}>Total Price: {cheapestGasStation.totalPrice.toFixed(2)} BAM</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.scanButton} onPress={() => setScannerVisible(true)}>
        <Text style={styles.scanButtonText}>Scan Card</Text>
      </TouchableOpacity>
      <View style={styles.cardContainer}>
  {scannedCards.map((card: ScannedCard, index: number) => (
    <TouchableOpacity 
      key={index} 
      style={styles.card} 
      onPress={() => setSelectedQRCode(card.data)}
    >
      <QRCode value={card.data} size={200} />
      <Text style={styles.cardName}>{card.name}</Text>

      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCard(index)}>
        <FontAwesome name="trash" size={24} color="#d9534f" />
      </TouchableOpacity>
    </TouchableOpacity>
  ))}
</View>




      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#2c2c2c' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Gas Station Details</Text>
            {cheapestGasStation && (
              <>
                <Image source={require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/assets/images/benz.jpg')} style={styles.detailsImage} />
                <Text style={[styles.modalDetail, { color: colorScheme === 'dark' ? '#ddd' : '#555' }]}>Name: {cheapestGasStation.fullName}</Text>
                <Text style={[styles.modalDetail, { color: colorScheme === 'dark' ? '#ddd' : '#555' }]}>Address: {cheapestGasStation.fullAddress}</Text>
                <Text style={[styles.modalDetail, { color: colorScheme === 'dark' ? '#ddd' : '#555' }]}>Price: {cheapestGasStation.totalPrice.toFixed(2)} KM</Text>
                <View style={styles.iconRow}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => callPhoneNumber(cheapestGasStation.phoneNumber)}>
                    <MaterialIcons name="phone" size={28} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => openGoogleMaps(cheapestGasStation.fullAddress)}>
                    <MaterialIcons name="place" size={28} color="#E91E63" />
                  </TouchableOpacity>
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
     <Modal
  animationType="slide"
  transparent={true}
  visible={!!selectedQRCode}
  onRequestClose={() => setSelectedQRCode(null)}
>
  <View style={styles.modalContainer}>
    <View style={[styles.qrModalContent, { backgroundColor: colorScheme === 'dark' ? '#2c2c2c' : '#fff' }]}>
      {selectedQRCode && <QRCode value={selectedQRCode} size={250} />}
      <TextInput
        style={[styles.cardNameInput, {  color: colorScheme === 'dark' ? '#fff' : '#000',backgroundColor: colorScheme === 'dark' ? '#333' : '#fff'}]}
        placeholder="Enter card name"
        value={cardName}
        onChangeText={setCardName}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveCardName}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedQRCode(null)}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={scannerVisible}
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          {scanned && (
            <TouchableOpacity onPress={() => setScanned(false)} style={styles.rescanButton}>
              <Text style={styles.rescanButtonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showOilTypeModal}
        onRequestClose={() => setShowOilTypeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#2c2c2c' : '#fff' }]}>
            {oilTypes.map(oil => (
              <TouchableOpacity
                key={oil.id}
                style={[styles.oilTypeOption, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}
                onPress={() => {
                  setSelectedOilType(oil.id);
                  setShowOilTypeModal(false);
                }}
              >
                <Text style={[styles.oilTypeText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{oil.shortName}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowOilTypeModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  </ScrollView>
</TouchableWithoutFeedback>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  oilTypeButton: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oilTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calculateButton: {
    backgroundColor: '#ffa726',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultDetail: {
    fontSize: 16,
    marginBottom: 5,
  },
  detailsImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },

  scanButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  qrModalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalDetail: {
    fontSize: 18,
    marginBottom: 10,
  },
  mapButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  callButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  callButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  rescanButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qrListContainer: {
    marginTop: 20,
  },
  qrListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  qrItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardContainer: {
    width: '100%',
    marginTop: 20,
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  oilTypeOption: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  cardName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
},
cardNameInput: {
  width: '100%',
  padding: 10,
  marginTop: 20,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,

},
saveButton: {
  backgroundColor: '#28a745',
  padding: 10,
  borderRadius: 5,
  marginTop: 10,
},
saveButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
});
