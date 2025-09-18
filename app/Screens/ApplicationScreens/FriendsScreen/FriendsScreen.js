import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../Hooks/authContext';
import { Ionicons } from '@expo/vector-icons';
import { TouchableWithoutFeedback } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';


function FriendsScreen(props) {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (user.id) {
                try {
                    const { data: friendships, error: friendshipError } = await supabase
                        .from('friendship')
                        .select('id, requester_id, recipient_id, status')
                        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
                        .eq('status', 'accepted');

                    if (friendshipError) {
                        console.error('Error fetching friendships:', friendshipError);
                        return;
                    }

                    const friendIds = friendships?.map(friendship => 
                        friendship.requester_id === user.id 
                            ? friendship.recipient_id 
                            : friendship.requester_id
                    ) || [];

                    if (friendIds.length === 0) {
                        setFriends([]);
                        return;
                    }

                    const { data: friendsData, error: usersError } = await supabase
                        .from('users')
                        .select('id, name')
                        .in('id', friendIds);

                    if (usersError) {
                        console.error('Error fetching user details:', usersError);
                        return;
                    }

                    const formattedFriends = friendsData?.map(friend => {
                        const friendship = friendships.find(f => 
                            f.requester_id === friend.id || f.recipient_id === friend.id
                        );
                        return {
                            id: friend.id,
                            name: friend.name,
                            friendshipId: friendship?.id,
                            avatar: '👤'
                        };
                    }) || [];

                    setFriends(formattedFriends);
                } catch (error) {
                    console.error('Error loading friends:', error);
                }
            }
            setIsLoaded(true);
        };
        loadData();
    }, [user.id]);

    useEffect(() => {
        if (user?.id && isLoaded) {
        }
    }, [friends, user?.id, isLoaded]);

    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteFriend = (friendId) => {
        Alert.alert(
            'Remove Friend',
            'Are you sure you want to remove this friend?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setFriends(prevFriends => prevFriends.filter(friend => friend.id !== friendId));
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1 }}>
                    <View style={styles.searchContainer}>
                        <View style={styles.searchInputWrapper}>
                            <Ionicons name="search" size={24} color="#1654b0" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search friends..."
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <TouchableOpacity style={styles.addFriendButton} onPress={() => navigation.navigate('AddFriendsScreen')}>
                            <Text style={styles.addFriendText}>+ Add Friend</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView>


                    </ScrollView>
                </View>
                
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
    },
    searchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingHorizontal: 10,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#1654b0',
        borderRadius: 24,
        paddingVertical: 10,
        paddingLeft: 12,
        width: '55%',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    addFriendButton: {
        width: '45%',
        alignItems: 'flex-end',
        alignSelf: 'center',
    },
    addFriendText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1654b0',
    },
});

export default FriendsScreen;