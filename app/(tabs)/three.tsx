import React from 'react';
import { StyleSheet, View, Text, StatusBar } from 'react-native';
import { LineChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import CustomGrid from '../../components/CustomGrid'; // Ensure this path is correct

const Three: React.FC = () => {
    const data = [50, 10, 40, 95, 85, 91, 35, 53, 24, 50, 20, 80];

    const Gradient = () => (
        <Defs key={'gradient'}>
            <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
                <Stop offset={'0%'} stopColor={'#000'} stopOpacity={0.8} />
                <Stop offset={'100%'} stopColor={'#000'} stopOpacity={0.2} />
            </LinearGradient>
        </Defs>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.time}>9:41</Text>
                <Text style={styles.status}>live</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.price}>92.46</Text>
                <Text style={styles.change}>↓0.32 (0.35%)</Text>
                <Text style={styles.time}>5:00 PM</Text>
                <LineChart
                    style={styles.chart}
                    data={data}
                    svg={{
                        strokeWidth: 2,
                        stroke: 'url(#gradient)',
                    }}
                    contentInset={{ top: 20, bottom: 20 }}
                    curve={shape.curveNatural}
                >
                    <CustomGrid />
                    <Gradient />
                </LineChart>
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerItem}>Live</Text>
                <Text style={styles.footerItem}>Markets</Text>
                <Text style={styles.footerItem}>Settings</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 50,
    },
    time: {
        color: '#fff',
        fontSize: 20,
    },
    status: {
        color: 'green',
        fontSize: 18,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    price: {
        color: '#fff',
        fontSize: 50,
    },
    change: {
        color: 'red',
        fontSize: 18,
    },
    chart: {
        height: 200,
        width: '100%',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
    },
    footerItem: {
        color: '#fff',
        fontSize: 16,
    },
});

export default Three;
