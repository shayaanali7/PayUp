import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../Hooks/authContext';

function FriendsScreen(props) {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newFriendName, setNewFriendName] = useState('');
    const [newFriendEmail, setNewFriendEmail] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (user.id) {
                setFriends([
                    { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', avatar: '👩‍💻' },
                    { id: '2', name: 'George Washington Carver', email: 'george@example.com', avatar: '👨‍🔬' },
                    { id: '3', name: 'Harry Houdini', email: 'harry@example.com', avatar: '🎩' },
                    { id: '4', name: 'Marcel Proust', email: 'marcel@example.com', avatar: '📚' },
                    { id: '5', name: 'Nellie Bly', email: 'nellie@example.com', avatar: '📰' },
                    { id: '6', name: 'Noor Inayat Khan', email: 'noor@example.com', avatar: '🎵' },
                    { id: '7', name: 'Wilbur Wright', email: 'wilbur@example.com', avatar: '✈️' }
                ]);
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

    const handleAddFriend = () => {
        if (!newFriendName.trim()) {
            Alert.alert('Error', 'Please enter a friend\'s name');
            return;
        }

        const newFriend = {
            id: Date.now().toString(),
            name: newFriendName.trim(),
            email: newFriendEmail.trim(),
            avatar: '👤'
        };

        setFriends(prevFriends => [...prevFriends, newFriend]);
        setNewFriendName('');
        setNewFriendEmail('');
        setIsAddModalVisible(false);
    };

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
            <View style={styles.header}>
                <Text style={styles.title}>Friends</Text>
                
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search friends..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView style={styles.friendsList} showsVerticalScrollIndicator={false}>
                {filteredFriends.map((friend) => (
                    <TouchableOpacity 
                        key={friend.id} 
                        style={styles.friendItem}
                        onLongPress={() => handleDeleteFriend(friend.id)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatar}>{friend.avatar}</Text>
                        </View>
                        <View style={styles.friendDetails}>
                            <Text style={styles.friendName}>{friend.name}</Text>
                            <Text style={styles.friendStatus}>settled up</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity 
                    style={styles.addFriendButton}
                    onPress={() => setIsAddModalVisible(true)}
                >
                    <Text style={styles.addFriendText}>+ add more friends</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                            <Text style={styles.cancelButton}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Add Friend</Text>
                        <TouchableOpacity onPress={handleAddFriend}>
                            <Text style={styles.saveButton}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter friend's name"
                                placeholderTextColor="#9CA3AF"
                                value={newFriendName}
                                onChangeText={setNewFriendName}
                                maxLength={50}
                                autoFocus
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email (Optional)</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter email address"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={newFriendEmail}
                                onChangeText={setNewFriendEmail}
                                maxLength={100}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#1654b0',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    searchContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    friendsList: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatar: {
        fontSize: 24,
    },
    friendDetails: {
        flex: 1,
    },
    friendName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 2,
    },
    friendStatus: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    addFriendButton: {
        paddingVertical: 20,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        marginTop: 20,
    },
    addFriendText: {
        fontSize: 16,
        color: '#1654b0',
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
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
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
    },
});

export default FriendsScreen;