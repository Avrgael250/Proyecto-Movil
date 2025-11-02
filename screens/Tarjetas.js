import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function Tarjetas() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.topBarTitle}>Tarjetas</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.text}>Contenido de Tarjetas</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3F2FD',
    },
    topBar: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    topBarTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#030213',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        color: '#030213',
    },
});