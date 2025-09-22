import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../Hooks/authContext';
import { TouchableWithoutFeedback } from 'react-native';

function FriendProfileScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    
    const { userId, userName } = route.params;
    
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        paidBy: user.id,
        splitWith: userId
    });
    const [balance, setBalance] = useState(0);
    const [friendshipId, setFriendshipId] = useState(null);
    const [friendshipData, setFriendshipData] = useState(null);

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [friendshipResult, expensesResult] = await Promise.all([
                supabase
                    .from('friendship')
                    .select('id, requester_id, recipient_id, total_owed')
                    .or(`and(requester_id.eq.${user.id},recipient_id.eq.${userId}),and(requester_id.eq.${userId},recipient_id.eq.${user.id})`)
                    .eq('status', 'accepted')
                    .single(),
                supabase
                    .from('expenses')
                    .select('*')
                    .or(`and(payer_id.eq.${user.id},receiver_id.eq.${userId}),and(payer_id.eq.${userId},receiver_id.eq.${user.id})`)
                    .order('created_at', { ascending: false })
            ]);

            if (friendshipResult.error) {
                console.error('Error loading friendship:', friendshipResult.error);
            } else {
                const friendship = friendshipResult.data;
                setFriendshipId(friendship.id);
                setFriendshipData(friendship);
                
                let calculatedBalance = friendship.total_owed || 0;
                if (friendship.recipient_id === user.id) {
                    calculatedBalance = -calculatedBalance;
                }
                setBalance(calculatedBalance);
            }

            if (expensesResult.error) {
                console.error('Error loading expenses:', expensesResult.error);
                Alert.alert('Error', 'Failed to load expenses');
            } else {
                setExpenses(expensesResult.data || []);
            }

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateFriendshipBalance = async (newBalanceChange) => {
        if (!friendshipData) return;
        try {
            let currentTotalOwed = friendshipData.total_owed || 0;
            let newTotalOwed;

            if (friendshipData.requester_id === user.id) {
                newTotalOwed = currentTotalOwed + newBalanceChange;
            } else {
                newTotalOwed = currentTotalOwed - newBalanceChange;
            }

            const { error: updateError } = await supabase
                .from('friendship')
                .update({ total_owed: newTotalOwed })
                .eq('id', friendshipId);
            if (updateError) {
                console.error('Error updating friendship balance:', updateError);
            } else {
                setFriendshipData(prev => ({ ...prev, total_owed: newTotalOwed }));
                let updatedBalance = newTotalOwed;
                if (friendshipData.recipient_id === user.id) {
                    updatedBalance = -updatedBalance;
                }
                setBalance(updatedBalance);
            }
        } catch (error) {
            console.error('Error updating friendship balance:', error);
        }
    };

    const handleAddExpense = async () => {
        if (!newExpense.description.trim() || !newExpense.amount.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const amount = parseFloat(newExpense.amount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        try {
            const newExpenseData = {
                description: newExpense.description,
                amount: amount,
                payer_id: newExpense.paidBy,
                receiver_id: newExpense.paidBy === user.id ? userId : user.id,
                created_at: new Date().toISOString(),
                payed: false
            };

            const { data, error } = await supabase
                .from('expenses')
                .insert(newExpenseData)
                .select()
                .single();

            if (error) {
                console.error('Error adding expense:', error);
                Alert.alert('Error', 'Failed to add expense');
                return;
            }
            const balanceChange = newExpense.paidBy === user.id ? amount : -amount;
            await updateFriendshipBalance(balanceChange);

            setExpenses(prev => [data, ...prev]);
            setNewExpense({
                description: '',
                amount: '',
                paidBy: user.id,
                splitWith: userId
            });
            setShowAddExpense(false);
            Alert.alert('Success', 'Expense added successfully');

        } catch (error) {
            console.error('Error adding expense:', error);
            Alert.alert('Error', 'Failed to add expense');
        }
    };

    const handleSettleExpense = async (expenseId) => {
        try {
            const expense = expenses.find(exp => exp.id === expenseId);
            if (!expense) {
                Alert.alert('Error', 'Expense not found');
                return;
            }

            const { error } = await supabase
                .from('expenses')
                .update({ payed: true })
                .eq('id', expenseId);

            if (error) {
                Alert.alert('Error', 'Failed to settle expense');
                return;
            }

            const amount = parseFloat(expense.amount);
            const balanceChange = expense.payer_id === user.id ? -amount : amount;
            await updateFriendshipBalance(balanceChange);
            setExpenses(prev => 
                prev.map(exp => 
                    exp.id === expenseId ? { ...exp, payed: true } : exp
                )
            );
            Alert.alert('Settled!', 'Expense has been marked as settled.');
        } catch (error) {
            Alert.alert('Error', 'Failed to settle expense');
        }
    };

    const renderExpense = (expense) => {
        const isPaidByCurrentUser = expense.payer_id === user.id;
        const isOwedByCurrentUser = expense.receiver_id === user.id;
        const amount = parseFloat(expense.amount);
        const isSettlement = expense.payed;

        return (
            <View
                key={expense.id}
                style={[
                    styles.expenseItem,
                    isSettlement && styles.settlementItem,
                    { borderRadius: 8, marginVertical: 6, backgroundColor: '#fff', elevation: 2 }
                ]}
            >
                <View style={styles.expenseIcon}>
                    <Ionicons
                        name={isSettlement ? "checkmark-circle" : "receipt"}
                        size={28}
                        color={isSettlement ? "#10B981" : "#6B7280"}
                    />
                </View>
                <View style={styles.expenseDetails}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.expenseDescription}>{expense.description}</Text>
                        <Text
                            style={[
                                styles.amountText,
                                isPaidByCurrentUser ? styles.positiveAmount : styles.negativeAmount
                            ]}
                        >
                            {isPaidByCurrentUser ? '+' : '-'}${amount.toFixed(2)}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                        <Text style={styles.expensePayer}>
                            {isPaidByCurrentUser ? 'You paid' : `${userName} paid`}
                        </Text>
                        <Text style={styles.expenseDate}>
                            {new Date(expense.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                    {!isSettlement && isOwedByCurrentUser ? (
                        <TouchableOpacity
                            style={styles.settleUpButton}
                            onPress={() => handleSettleExpense(expense.id)}
                        >
                            <Ionicons name="checkmark" size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1654b0" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{userName}</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1654b0" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1654b0" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{userName}</Text>
                    <TouchableOpacity onPress={() => setShowAddExpense(true)} style={styles.addButton}>
                        <Ionicons name="add" size={24} color="#1654b0" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.balanceCard}>
                        <View style={styles.balanceHeader}>
                            <Text style={styles.balanceLabel}>Balance</Text>
                        </View>
                        
                        <View style={styles.balanceAmount}>
                            {Math.abs(balance) < 0.01 ? (
                                <Text style={styles.balanceZero}>You're all payed up!</Text>
                            ) : balance > 0 ? (
                                <View>
                                    <Text style={styles.balancePositive}>${balance.toFixed(2)}</Text>
                                    <Text style={styles.balanceSubtext}>{userName} owes you</Text>
                                </View>
                            ) : (
                                <View>
                                    <Text style={styles.balanceNegative}>${Math.abs(balance).toFixed(2)}</Text>
                                    <Text style={styles.balanceSubtext}>You owe {userName}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.expensesSection}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        {expenses.length > 0 ? (
                            expenses.map(renderExpense)
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyStateText}>No expenses yet</Text>
                                <Text style={styles.emptyStateSubtext}>Add an expense to get started</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                <Modal
                    visible={showAddExpense}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowAddExpense(false)}>
                                <Text style={styles.cancelButton}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Add Expense</Text>
                            <TouchableOpacity onPress={handleAddExpense}>
                                <Text style={styles.saveButton}>Save</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                            <View style={styles.modalContent}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="What was this expense for?"
                                    value={newExpense.description}
                                    onChangeText={(text) => setNewExpense({...newExpense, description: text})}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Amount</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="0.00"
                                        value={newExpense.amount}
                                        onChangeText={(text) => setNewExpense({...newExpense, amount: text})}
                                        keyboardType="decimal-pad"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Paid by</Text>
                                    <View style={styles.radioGroup}>
                                        <TouchableOpacity
                                            style={styles.radioOption}
                                            onPress={() => setNewExpense({...newExpense, paidBy: user.id})}
                                        >
                                            <View style={[styles.radio, newExpense.paidBy === user.id && styles.radioSelected]} />
                                            <Text style={styles.radioText}>You</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.radioOption}
                                            onPress={() => setNewExpense({...newExpense, paidBy: userId})}
                                        >
                                            <View style={[styles.radio, newExpense.paidBy === userId && styles.radioSelected]} />
                                            <Text style={styles.radioText}>{userName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </SafeAreaView>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    addButton: {
        padding: 8,
        marginRight: -8,
    },
    headerRight: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    balanceCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    balanceLabel: {
        fontSize: 16,
        color: '#6B7280',
    },
    settleButton: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    settleUpButton: {
        backgroundColor: '#10B981',
        borderRadius: 20,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
        elevation: 2,
    },
    settleButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    settleButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    balanceAmount: {
        alignItems: 'center',
    },
    balanceZero: {
        fontSize: 18,
        color: '#10B981',
        fontWeight: '600',
    },
    balancePositive: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#10B981',
        textAlign: 'center',
    },
    balanceNegative: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#EF4444',
        textAlign: 'center',
    },
    balanceSubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
    },
    expensesSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        padding: 16,
        paddingBottom: 0,
    },
    expenseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    settlementItem: {
        backgroundColor: '#F0FDF4',
    },
    expenseIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    expenseDetails: {
        flex: 1,
    },
    expenseDescription: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    expenseDate: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    expensePayer: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    expenseAmount: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '600',
    },
    positiveAmount: {
        color: '#10B981',
    },
    negativeAmount: {
        color: '#EF4444',
    },
    settlementText: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 16,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    cancelButton: {
        fontSize: 16,
        color: '#6B7280',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    saveButton: {
        fontSize: 16,
        color: '#1654b0',
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 20,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 8,
    },
    radioSelected: {
        borderColor: '#1654b0',
        backgroundColor: '#1654b0',
    },
    radioText: {
        fontSize: 16,
        color: '#1F2937',
    },
});

export default FriendProfileScreen;