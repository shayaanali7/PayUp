import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../Hooks/authContext';
import { supabase } from '../../../lib/supabase';
import SearchBarComponet from '../../../Components/SearchBarComponet';

function AddFriendScreen(props) {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleAddFriend = async (friendUser) => {
        if (!friendUser || !friendUser.id) {
            throw new Error("Invalid user selected.");
        }
        
        if (friendUser.id === user.id) {
            throw new Error("You cannot add yourself as a friend.");
        }
        
        setIsLoading(true);
        try {
            const friendId = friendUser.id;
            const { data: existingFriendships, error: checkError } = await supabase
                .from('friendship')
                .select('*')
                .or(`and(requester_id.eq.${user.id},recipient_id.eq.${friendId}),and(requester_id.eq.${friendId},recipient_id.eq.${user.id})`);

            if (checkError) {
                console.error('Error checking existing friendship:', checkError);
                throw new Error('Failed to check existing friendship. Please try again.');
            }

            if (existingFriendships && existingFriendships.length > 0) {
                const existingFriendship = existingFriendships[0];
                let message = '';
                if (existingFriendship.status === 'pending') {
                    message = existingFriendship.requester_id === user.id 
                        ? 'Friend request already sent!' 
                        : 'You have a pending friend request from this user!';
                } else if (existingFriendship.status === 'accepted') {
                    message = 'You are already friends with this user!';
                }
                throw new Error(message);
            }

            const { error: addingFriendError } = await supabase
                .from('friendship')
                .insert({
                    requester_id: user.id,
                    recipient_id: friendId,
                    status: 'pending'
                });
                
            if (addingFriendError) {
                console.error('Error adding friend:', addingFriendError);
                throw new Error('Failed to send friend request. Please try again.');
            }
            
            Alert.alert(
                "Friend Request Sent", 
                `Friend request sent to ${friendUser.name}!`,
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack()
                    }
                ]
            );
            
        } catch (error) {
            console.error('Error adding friend:', error);
            Alert.alert('Error', error.message || 'Failed to send friend request. Please try again.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
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
                    <Text style={styles.headerTitle}>Add Friends</Text>
                    <View></View>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <SearchBarComponet onUserSelect={handleAddFriend} placeholder='Search by name or username...' />
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
        alignContent: 'center',
        paddingRight: 20,
        fontWeight: '600',
        color: '#1F2937',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
});

export default AddFriendScreen;