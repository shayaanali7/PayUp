import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../Hooks/authContext';
import { Ionicons } from '@expo/vector-icons';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';

function FriendsScreen(props) {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [processingRequest, setProcessingRequest] = useState(null);

    const loadData = async () => {
        if (user.id) {
            try {
                const { data: friendships, error: friendshipError } = await supabase
                    .from('friendship')
                    .select('id, requester_id, recipient_id, status, total_owed')
                    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

                if (friendshipError) {
                    console.error('Error fetching friendships:', friendshipError);
                    setFriends([]);
                    setFriendRequests([]);
                } else {
                    const userIds = new Set();
                    const acceptedFriendships = [];
                    const pendingRequests = [];

                    friendships?.forEach(friendship => {
                        if (friendship.status === 'accepted') {
                            const friendId = friendship.requester_id === user.id 
                                ? friendship.recipient_id 
                                : friendship.requester_id;
                            userIds.add(friendId);
                            acceptedFriendships.push(friendship);
                        } else if (friendship.status === 'pending' && friendship.recipient_id === user.id) {
                            userIds.add(friendship.requester_id);
                            pendingRequests.push(friendship);
                        }
                    });

                    let usersData = [];
                    if (userIds.size > 0) {
                        const { data: users, error: usersError } = await supabase
                            .from('users')
                            .select('id, name, username')
                            .in('id', Array.from(userIds));

                        if (usersError) {
                            console.error('Error fetching user details:', usersError);
                        } else {
                            usersData = users || [];
                        }
                    }

                    const formattedFriends = acceptedFriendships.map(friendship => {
                        const friendId = friendship.requester_id === user.id 
                            ? friendship.recipient_id 
                            : friendship.requester_id;
                        const friend = usersData.find(u => u.id === friendId);
                        
                        let balance = friendship.total_owed || 0;
                        if (friendship.recipient_id === user.id) {
                            balance = -balance;
                        }

                        return {
                            id: friendId,
                            name: friend?.name || 'Unknown User',
                            username: friend?.username,
                            friendshipId: friendship.id,
                            balance: balance,
                            avatar: '👤'
                        };
                    });

                    const formattedRequests = pendingRequests.map(request => {
                        const requester = usersData.find(u => u.id === request.requester_id);
                        return {
                            id: request.id,
                            friendshipId: request.id,
                            userId: request.requester_id,
                            name: requester?.name || 'Unknown User',
                            username: requester?.username,
                            avatar: '👤'
                        };
                    });
                    setFriends(formattedFriends);
                    setFriendRequests(formattedRequests);
                }
            } catch (error) {
                console.error('Error loading friends:', error);
            }
        }
        setIsLoaded(true);
    };

    useEffect(() => {
        loadData();
    }, [user.id]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadData();
        });

        return unsubscribe;
    }, [navigation]);

    const handleAcceptRequest = async (requestId, userId) => {
        setProcessingRequest(requestId);
        try {
            const { error } = await supabase
                .from('friendship')
                .update({ status: 'accepted' })
                .eq('id', requestId);

            if (error) {
                console.error('Error accepting friend request:', error);
                Alert.alert('Error', 'Failed to accept friend request. Please try again.');
            } else {
                await loadData();
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
            Alert.alert('Error', 'Failed to accept friend request. Please try again.');
        } finally {
            setProcessingRequest(null);
        }
    };

    const handleDeclineRequest = async (requestId) => {
        setProcessingRequest(requestId);
        try {
            const { error } = await supabase
                .from('friendship')
                .delete()
                .eq('id', requestId);

            if (error) {
                console.error('Error declining friend request:', error);
                Alert.alert('Error', 'Failed to decline friend request. Please try again.');
            } else {
                setFriendRequests(prev => prev.filter(req => req.friendshipId !== requestId));
                Alert.alert('Success', 'Friend request declined.');
            }
        } catch (error) {
            console.error('Error declining friend request:', error);
            Alert.alert('Error', 'Failed to decline friend request. Please try again.');
        } finally {
            setProcessingRequest(null);
        }
    };

    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) || (friend.username && friend.username.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderFriendRequest = (request) => (
        <View key={request.friendshipId} style={styles.friendRequestItem}>
            <View style={styles.friendInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {request.name ? request.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>
                <View style={styles.friendDetails}>
                    <Text style={styles.friendName}>{request.name}</Text>
                    {request.username && (
                        <Text style={styles.friendUsername}>@{request.username}</Text>
                    )}
                </View>
            </View>
            <View style={styles.requestActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAcceptRequest(request.friendshipId, request.userId)}
                    disabled={processingRequest === request.friendshipId}
                >
                    {processingRequest === request.friendshipId ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleDeclineRequest(request.friendshipId)}
                    disabled={processingRequest === request.friendshipId}
                >
                    {processingRequest === request.friendshipId ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="close" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderBalanceText = (balance) => {
        if (Math.abs(balance) < 0.01) {
            return <Text style={styles.balanceZero}>Settled up</Text>;
        } else if (balance > 0) {
            return <Text style={styles.balancePositive}>owes you ${balance.toFixed(2)}</Text>;
        } else {
            return <Text style={styles.balanceNegative}>you owe ${Math.abs(balance).toFixed(2)}</Text>;
        }
    };

    const renderFriend = (friend) => (
        <TouchableOpacity key={friend.id} style={styles.friendItem} onPress={() => navigation.navigate('FriendProfileScreen', { userId: friend.id, userName: friend.username })}>
            <View style={styles.friendInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {friend.name ? friend.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>
                <View style={styles.friendDetails}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    {friend.username && (
                        <Text style={styles.friendUsername}>@{friend.username}</Text>
                    )}
                </View>
                <View>
                    {friend.balance !== undefined && renderBalanceText(friend.balance)}
                </View>
            </View>
        </TouchableOpacity>
    );

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

                    <ScrollView style={styles.scrollView}>
                        {friendRequests.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionHeader}>
                                    Friend Requests ({friendRequests.length})
                                </Text>
                                <View style={styles.sectionContent}>
                                    {friendRequests.map(renderFriendRequest)}
                                </View>
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>
                                Friends ({filteredFriends.length})
                            </Text>
                            <View style={styles.sectionContent}>
                                {filteredFriends.length > 0 ? (
                                    filteredFriends.map(renderFriend)
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                                        <Text style={styles.emptyStateText}>
                                            {searchQuery ? 'No friends match your search' : 'No friends yet'}
                                        </Text>
                                        <Text style={styles.emptyStateSubtext}>
                                            {searchQuery ? 'Try a different search term' : 'Add some friends to get started!'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
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
    scrollView: {
        flex: 1,
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    sectionContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    friendRequestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1654b0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    friendDetails: {
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    friendUsername: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    requestActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptButton: {
        backgroundColor: '#10B981',
    },
    declineButton: {
        backgroundColor: '#EF4444',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 4,
    },
    balanceZero: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
        marginTop: 2,
    },
    balancePositive: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
        marginTop: 2,
    },
    balanceNegative: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '500',
        marginTop: 2,
    },
});

export default FriendsScreen;