import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DetailsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Product Details</Text>
            <Text style={styles.content}>
                This is a native screen with a real iOS navigation bar and back button.
                Try swiping from the left edge to go back!
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    content: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
    },
});

export default DetailsScreen;
