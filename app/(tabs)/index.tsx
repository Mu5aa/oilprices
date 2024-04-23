import React, { useState, useEffect } from 'react';
import { Appearance, StyleSheet, View, Image, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface Location {
  latitude: number;
  longitude: number;
}


export default function TabOneScreen() {
  // Detect initial color scheme
  const initialColorScheme = Appearance.getColorScheme();

  const [colorScheme, setColorScheme] = useState(initialColorScheme);

  useEffect(() => {
    // Listen for color scheme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Coordinates for Kiseljak, Bosnia and Herzegovina
  const kiseljakCoordinates = {
    latitude: 43.9426,
    longitude: 18.0763,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };
  // Array of selected locations
  const selectedLocations: Location[] = [
    { latitude: 43.961235763484915, longitude: 18.05658163617972 }, // curic
    { latitude: 43.97042427861928, longitude: 18.053852547010756 }, // hifa
    { latitude: 43.97273319661385, longitude: 18.05162396098856 }, // grakop
    { latitude: 43.97560604005778, longitude: 18.05007164364737 }, // bilan 1
    { latitude: 43.97522980892014, longitude: 18.049259588155618 }, // bilan 2
  ];
  // Custom marker image
  const customMarker = require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png'); 
  // Location icon image
  const locationIcon = require('/Applications/XAMPP/xamppfiles/htdocs/oilprices/petrol-station_8996900.png');

  return (
    <View style={styles.container}>
<MapView
  style={styles.map}
  initialRegion={kiseljakCoordinates}
  provider="google"
  showsUserLocation={true}
  showsMyLocationButton={true}
  zoomControlEnabled={true}
  loadingEnabled={true}
  showsCompass={true}
  showsTraffic={false}
  rotateEnabled={true}
  customMapStyle={colorScheme === 'dark' ? darkType : []}
>

        {/* Markers for selected locations */}
        {selectedLocations.map((location, index) => (
          <Marker
            key={index}
            coordinate={location}
            title={`Location ${index + 1}`}
            description={`Custom description for Location ${index + 1}`}
          >
            <Image source={customMarker} style={{ width: 52, height: 52 }} />
          </Marker>
        ))}
      </MapView>
      {/* Overlay bar at the top */}
      <View style={[styles.overlay, { backgroundColor: colorScheme === 'dark' ? '#333333' : '#FBFCF8' }]}>
        <Text style={[styles.overlayText, { color: colorScheme === 'dark' ? 'white' : '#808080' }]}>Kiseljak</Text>
        <Image source={locationIcon} style={styles.locationIcon} />
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  overlayText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  locationIcon: {
    width: 34,
    height: 34,
  },

  
});
