import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Button, Alert, Text, View } from 'react-native';
import { Camera, CameraType, BarCodeScannerResult, requestCameraPermissionsAsync } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScanBarcodeScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<string>('');
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      const storedBarcode = await AsyncStorage.getItem('barcode');
      if (storedBarcode) {
        setBarcode(storedBarcode);
      }
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: BarCodeScannerResult) => {
    setScanned(true);
    setBarcode(data);
    AsyncStorage.setItem('barcode', data);
    Alert.alert('Bar code scanned!', `Bar code with type ${type} and data ${data} has been scanned and stored.`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan your discount card barcode</Text>
      <View style={styles.separator} />
      {scanned ? (
        <View style={styles.barcodeContainer}>
          <Text style={styles.barcodeText}>Stored Barcode: {barcode}</Text>
          <Button title={'Scan again'} onPress={() => setScanned(false)} />
        </View>
      ) : (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: ['code128', 'qr'],
          }}
          type={CameraType.back}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#EEE'
  },
  barcodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeText: {
    fontSize: 18,
    marginVertical: 20,
  },
});
