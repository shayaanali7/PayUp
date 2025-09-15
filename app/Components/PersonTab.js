import React from 'react';
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity } from 'react-native';
import ItemElement from './ItemElement';

function PersonTab({ people, tax, personData, setPersonData }) {

    const handleAddItem = (personId) => {
        setPersonData(prev => {
            const currentPersonData = prev[personId] || { itemList: [], nextItemId: 1, items: {} };
            return {
                ...prev,
                [personId]: {
                    ...currentPersonData,
                    itemList: [...currentPersonData.itemList, currentPersonData.nextItemId],
                    nextItemId: currentPersonData.nextItemId + 1
                }
            };
        });
    };

    const handleRemoveItem = (personId, itemId) => {
        setPersonData(prev => {
            const currentPersonData = prev[personId];
            if (!currentPersonData) return prev;

            const updatedItems = { ...currentPersonData.items };
            delete updatedItems[itemId];

            return {
                ...prev,
                [personId]: {
                    ...currentPersonData,
                    itemList: currentPersonData.itemList.filter(id => id !== itemId),
                    items: updatedItems
                }
            };
        });
    };

    const handleItemChange = (personId, itemId, itemData) => {
        setPersonData(prev => {
            const currentPersonData = prev[personId] || { itemList: [], nextItemId: 1, items: {} };
            return {
                ...prev,
                [personId]: {
                    ...currentPersonData,
                    items: {
                        ...currentPersonData.items,
                        [itemId]: itemData
                    }
                }
            };
        });
    };

    const calculatePersonTotal = (personId) => {
        const currentPersonData = personData[personId] || { items: {} };
        const itemsTotal = Object.values(currentPersonData.items).reduce((sum, item) => {
            return sum + (item.price || 0);
        }, 0);

        const taxPerPerson = (tax || 0) / (people || 1);
        const total = itemsTotal + taxPerPerson;
        return isNaN(total) ? 0 : total;
    };

    const renderPersonItem = ({ item, index }) => {
        const personId = item.id;
        const currentPersonData = personData[personId] || { itemList: [], nextItemId: 1, items: {} };
        const totalOwed = calculatePersonTotal(personId)

        return (
            <View style={styles.personContainer}>
                <View style={styles.personCard}>
                    <View style={styles.personHeader}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.personName}>Person {index + 1}</Text>
                    </View>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Owes</Text>
                        <Text style={styles.amountValue}>${totalOwed.toFixed(2)}</Text>
                    </View>
                </View>
                
                {currentPersonData.itemList.length > 0 && (
                    <View style={styles.itemsSection}>
                        {currentPersonData.itemList.map((itemId) => (
                            <ItemElement 
                                key={itemId} 
                                id={itemId} 
                                initialData={currentPersonData.items[itemId] || { name: `Item ${itemId}`, price: 0 }}
                                onItemChange={(itemId, itemData) => handleItemChange(personId, itemId, itemData)}
                                onRemoveItem={(itemId) => handleRemoveItem(personId, itemId)}
                            />
                        ))}
                    </View>
                )}
                
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddItem(personId)}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const peopleArray = Array.from({ length: people }, (_, index) => ({ id: index }));
    if (people === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Enter the number of people to see the breakdown</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Breakdown</Text>
            <FlatList
                data={peopleArray}
                renderItem={renderPersonItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 20,
    },
    personContainer: {
        marginBottom: 24,
        position: 'relative',
    },
    personCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    personHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    personName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amountLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#DC2626',
    },
    itemsSection: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderTopWidth: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
        marginTop: -16,
        zIndex: 0,
    },
    buttonWrapper: {
        alignItems: 'center',
        marginTop: -20,
        zIndex: 2,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1654b0',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    addButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        lineHeight: 24,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default PersonTab;