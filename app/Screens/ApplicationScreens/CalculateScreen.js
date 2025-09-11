import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Button } from 'react-native';
import PersonTab from '../../Components/PersonTab';
import ItemElement from '../../Components/ItemElement';

function CalculateScreen(props) {
    const [tax, setTax] = useState('0');
    const [people, setPeople] = useState('');
    const [itemList, setItemList] = useState([]);
    const [nextItemId, setNextItemId] = useState(1);
    const [items, setItems] = useState({});

    const handleTaxChange = (text) => {
        const numericText = text.replace(/[^0-9.]/g, '');
        setTax(numericText);
    };

    const handlePeopleChange = (text) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setPeople(numericText);
    };

    const handleAddItem = () => {
        setItemList(prev => [...prev, nextItemId]);
        setNextItemId(prev => prev + 1);
    };

    const handleRemoveItem = (itemId) => {
        setItemList(prev => prev.filter(id => id !== itemId));
        setItems(prev => {
            const updated = { ...prev };
            delete updated[itemId];
            return updated;
        });
        console.log(itemList);
    };

    const handleItemChange = (itemId, itemData) => {
        setItems(prev => ({
            ...prev,
            [itemId]: itemData
        }));
    };

    const taxAmount = parseFloat(tax) || 0;
    const peopleCount = parseInt(people) || 0;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Manual Calculator</Text>
                    </View>

                    <View style={styles.inputSection}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Number of People</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder='Enter number of people'
                                placeholderTextColor="#9CA3AF"
                                keyboardType='numeric'
                                value={people}
                                onChangeText={handlePeopleChange}
                                maxLength={2}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Total Tax Amount (Optional)</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder='Enter total tax amount'
                                placeholderTextColor="#9CA3AF"
                                keyboardType='decimal-pad'
                                value={tax}
                                onChangeText={handleTaxChange}
                            />
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Add Item"
                            onPress={handleAddItem}
                        />
                    </View>

                    {itemList.length > 0 && (
                        <View style={styles.itemsSection}>
                            <Text style={styles.sectionTitle}>Items</Text>
                            {itemList.map((itemId) => (
                                <ItemElement 
                                    key={itemId} 
                                    id={itemId} 
                                    onItemChange={handleItemChange}
                                    onRemoveItem={handleRemoveItem}
                                />
                            ))}
                        </View>
                    )}

                    {peopleCount > 0 && (
                        <View style={styles.resultsSection}>
                            <PersonTab people={peopleCount} tax={taxAmount} items={items} />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    inputSection: {
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1F2937',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    buttonContainer: {
        marginBottom: 20,
    },
    itemsSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 15,
    },
    resultsSection: {
        flex: 1,
    },
});

export default CalculateScreen;