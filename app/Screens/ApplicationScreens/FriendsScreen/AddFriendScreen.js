import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, View } from 'react-native';
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
            alert("Invalid user selected.");
            return;
        }
        setIsLoading(true);

        try {
            const friendId = data[0].id;
            const { error: addingFriendError } = await supabase
                .from('friendship')
                .insert({
                    requester_id: user.id,
                    recipient_id: friendId,
                    status: 'pending'
            });
            if (addingFriendError) {
                console.error('Error adding friend:', addingFriendError);
                alert('Failed to send friend request. Please try again.');
                setIsLoading(false);
                return;
            }
            Alert.alert(
                "Friend Request Sent", 
                `Friend request sent to ${selectedUser.name}!`,
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        }
        catch (error) {
            console.error('Error adding friend:', error);
            alert('Failed to send friend request. Please try again.');
        }
    }

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