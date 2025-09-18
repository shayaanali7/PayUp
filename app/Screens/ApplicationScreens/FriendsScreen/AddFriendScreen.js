import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../Hooks/authContext';
import { supabase } from '../../../lib/supabase';

function AddFriendScreen(props) {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [friendName, setFriendName] = useState('');
    const [friendEmail, setFriendEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddFriend = () => {
        if (!friendName.trim() || !friendEmail.trim()) {
            alert("Friend's name and email are required.");
            return;
        }
        setIsLoading(true);

        const { data, error } = supabase
            .from('users')
            .select('id')
            .eq('email', friendEmail.trim().toLowerCase())

        if (error) {
            alert("Error fetching user.");
            setIsLoading(false);
            return;
        }

        if (!data) {
            alert("User not found.");
            setIsLoading(false);
            return;
        }

        const friendId = data[0].id;
        const { error: addingFriendError } = supabase
            .from('friendship')
            .insert({
                requester_id: user.id,
                recipient_id: friendId,
                status: 'pending'
            })
    }

    const handleCancel = () => {
        setFriendName('');
        setFriendEmail('');
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1654b0" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Friend</Text>
                    <TouchableOpacity 
                        onPress={handleAddFriend} 
                        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                        disabled={isLoading}
                    >
                        <Text style={[styles.saveButtonText, isLoading && styles.saveButtonTextDisabled]}>
                            {isLoading ? 'Adding...' : 'Add'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Friend's Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter friend's name"
                            placeholderTextColor="#9CA3AF"
                            value={friendName}
                            onChangeText={setFriendName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email (Required)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter friend's email"
                            placeholderTextColor="#9CA3AF"
                            value={friendEmail}
                            onChangeText={setFriendEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.infoHeader}>
                            <Ionicons name="information-circle" size={20} color="#1654b0" />
                            <Text style={styles.infoTitle}>How it works</Text>
                        </View>
                        <Text style={styles.infoText}>
                            Add friends to share expenses and split bills together. 
                            You can search for them by name or email address.
                        </Text>
                    </View>

                    <View style={styles.tipsSection}>
                        <Text style={styles.tipsTitle}>Tips:</Text>
                        <View style={styles.tipItem}>
                            <Text style={styles.tipBullet}>•</Text>
                            <Text style={styles.tipText}>Make sure the name matches exactly</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Text style={styles.tipBullet}>•</Text>
                            <Text style={styles.tipText}>Email helps find the right person</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Text style={styles.tipBullet}>•</Text>
                            <Text style={styles.tipText}>They'll receive a friend request notification</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoid: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#fff',
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
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#1654b0',
        borderRadius: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonTextDisabled: {
        color: '#E5E7EB',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#F9FAFB',
    },
    infoSection: {
        marginTop: 32,
        padding: 16,
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#1654b0',
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1654b0',
        marginLeft: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    tipsSection: {
        marginTop: 24,
        marginBottom: 32,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    tipBullet: {
        color: '#1654b0',
        fontSize: 16,
        marginRight: 8,
        marginTop: 2,
    },
    tipText: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
        lineHeight: 20,
    },
});

export default AddFriendScreen;