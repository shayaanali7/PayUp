import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function ItemElement({ id, onItemChange, onRemoveItem }) {
    const [itemName, setItemName] = useState(`Item ${id}`);
    const [itemPrice, setItemPrice] = useState('');
    
    useEffect(() => {
        if (onItemChange) {
            onItemChange(id, { name: itemName, price: 0 });
        }
    }, []);

    const handleNameChange = (text) => {
        setItemName(text);
        if (onItemChange) {
            onItemChange(id, { name: text, price: parseFloat(itemPrice) || 0 });
        }
    };

    const handlePriceChange = (text) => {
        const numericText = text.replace(/[^0-9.]/g, '');
        setItemPrice(numericText);
        if (onItemChange) {
            onItemChange(id, { name: itemName, price: parseFloat(numericText) || 0 });
        }
    };

    const handleRemoveItem = () => {
        if (onRemoveItem) {
            onRemoveItem(id);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.itemContainer}>
                <View style={styles.nameContainer}>
                    <TextInput 
                        style={styles.itemTitle} 
                        onChangeText={handleNameChange} 
                        value={itemName}
                        placeholder={`Item ${id}`}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
                
                <View style={styles.priceContainer}>
                    <Text style={styles.dollarSign}>$</Text>
                    <TextInput 
                        style={styles.itemPrice} 
                        onChangeText={handlePriceChange} 
                        placeholder='0.00' 
                        placeholderTextColor="#9CA3AF"
                        value={itemPrice}
                        keyboardType="decimal-pad"
                        textAlign="right"
                    />
                </View>
                
                <TouchableOpacity style={styles.deleteButton} onPress={handleRemoveItem}>
                    <Ionicons name="trash-bin-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        position: 'relative',
    },
    deleteButton: {
        position: 'absolute',
        top: -30,
        right: -25,
        width: 30,
        height: 30,
        borderRadius: 500,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    nameContainer: {
        flex: 2,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        flex: 1,
        minWidth: 20,
    },
    dollarSign: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginRight: 4,
    },
    itemPrice: {
        fontSize: 16,
        color: '#059669',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
});

export default ItemElement;