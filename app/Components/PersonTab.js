import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

function PersonTab({ people, tax }) {
    const amountPerPerson = (tax / people).toFixed(2);

    const renderPersonItem = ({ item, index }) => (
        <View style={styles.personCard}>
            <View style={styles.personHeader}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{index + 1}</Text>
                </View>
                <Text style={styles.personName}>Person {index + 1}</Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Owes</Text>
                <Text style={styles.amountValue}>${amountPerPerson}</Text>
            </View>
        </View>
    );

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
            <Text style={styles.sectionTitle}>Tax Breakdown</Text>
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