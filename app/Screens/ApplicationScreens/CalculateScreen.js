import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Button, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PersonTab from '../../Components/PersonTab';
import { getCalculatorData, handleClearData, saveCalculatorData } from '../../Hooks/calculatorData';
import { useAuth } from '../../Hooks/authContext';

function CalculateScreen(props) {
    const { user } = useAuth();
    const [tax, setTax] = useState('0');
    const [people, setPeople] = useState('');
    const [personData, setPersonData] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (user.id) {
                const data = await getCalculatorData(user.id);
                if (data) {
                    setTax(data.tax.toString() || '0');
                    setPeople(data.people.toString() || '0');
                    setPersonData(data.personData || {});
                } else {
                    setTax('0');
                    setPeople('');
                    setPersonData({});
                }
            }
            console.log(personData[0]?.items);
            setIsLoaded(true); 
        }
        loadData();
    }, [user.id]);

    useEffect(() => {
        if (user?.id && isLoaded) {
            saveCalculatorData(user.id, { tax, people, personData });
        }
    }, [tax, people, personData, user?.id, isLoaded]);  

    const handleTaxChange = (text) => {
        const numericText = text.replace(/[^0-9.]/g, '');
        setTax(numericText);
    };

    const handlePeopleChange = (text) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setPeople(numericText);
    };

    const taxAmount = parseFloat(tax) || 0;
    const peopleCount = parseInt(people) || 0;

    const handleClear = async () => {
        setTax('0');
        setPeople('');
        setPersonData({});
        if (user?.id) {
            await saveCalculatorData(user.id);
        }
    }

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

                        <View>
                            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {peopleCount > 0 && (
                        <View style={styles.resultsSection}>
                            <PersonTab people={peopleCount} tax={taxAmount} personData={personData} setPersonData={setPersonData} />
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
        backgroundColor: '#ffffffff',
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
        marginBottom: 5,
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
    clearButton: {
        backgroundColor: '#1654b0',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    clearButtonText: {
        color: '#ffffffff',
        fontSize: 16,
        fontWeight: '600',
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