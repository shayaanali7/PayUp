import React, { useEffect, useState } from 'react';
import { Text, TextInput, View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../Hooks/authContext';
import { Ionicons } from '@expo/vector-icons';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

function GroupScreen(props) {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [groupInvites, setGroupInvites] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [processingRequest, setProcessingRequest] = useState(null);

    const loadData = async () => {
        if (user.id) {
            try {
                const { data: userGroups, error: groupsError } = await supabase
                    .from('group_members')
                    .select(`
                        id,
                        role,
                        status,
                        total_owed,
                        joined_at,
                        groups ( 
                            id,
                            name,
                            description,
                            created_at
                        )
                    `)
                    .eq('member_id', user.id);
            } catch (error) {
                console.error('Error loading groups:', error);
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

    const handleAcceptInvite = async (inviteId, groupId) => {
        setProcessingRequest(inviteId);
        try {
            // TODO: Implement accept group invitation logic
            // const { error } = await supabase...
            
            console.log('Accepting group invite:', inviteId, groupId);
            await loadData();
        } catch (error) {
            console.error('Error accepting group invite:', error);
            Alert.alert('Error', 'Failed to accept group invitation. Please try again.');
        } finally {
            setProcessingRequest(null);
        }
    };

    const handleDeclineInvite = async (inviteId) => {
        setProcessingRequest(inviteId);
        try {
            // TODO: Implement decline group invitation logic
            // const { error } = await supabase...
            
            console.log('Declining group invite:', inviteId);
            setGroupInvites(prev => prev.filter(invite => invite.id !== inviteId));
            Alert.alert('Success', 'Group invitation declined.');
        } catch (error) {
            console.error('Error declining group invite:', error);
            Alert.alert('Error', 'Failed to decline group invitation. Please try again.');
        } finally {
            setProcessingRequest(null);
        }
    };

    const handleCreateGroup = () => {
        navigation.navigate('CreateGroupScreen');
    };

    const handleGroupPress = (group) => {
        // TODO: Navigate to group details screen
        console.log('Navigate to group:', group.id);
        // navigation.navigate('GroupDetailsScreen', { groupId: group.id });
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderGroupInvite = (invite) => (
        <View key={invite.id} style={styles.inviteItem}>
            <LinearGradient
                colors={[invite.color + '20', invite.color + '10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inviteGradient}
            >
                <View style={styles.inviteContent}>
                    <View style={styles.inviteInfo}>
                        <View style={[styles.groupIcon, { backgroundColor: invite.color }]}>
                            <Text style={styles.groupIconText}>{invite.icon}</Text>
                        </View>
                        <View style={styles.inviteDetails}>
                            <Text style={styles.inviteGroupName}>{invite.groupName}</Text>
                            <Text style={styles.inviteText}>
                                Invited by <Text style={styles.inviterName}>{invite.inviterName}</Text>
                            </Text>
                            <View style={styles.inviteMetaInfo}>
                                <Ionicons name="people" size={14} color="#6B7280" />
                                <Text style={styles.inviteMemberCount}>{invite.memberCount} members</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.inviteActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.acceptButton]}
                            onPress={() => handleAcceptInvite(invite.id, invite.groupId)}
                            disabled={processingRequest === invite.id}
                        >
                            {processingRequest === invite.id ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="checkmark" size={18} color="#fff" />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.declineButton]}
                            onPress={() => handleDeclineInvite(invite.id)}
                            disabled={processingRequest === invite.id}
                        >
                            {processingRequest === invite.id ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="close" size={18} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    const renderBalanceText = (balance, totalBalance) => {
        if (Math.abs(balance) < 0.01) {
            return <Text style={styles.balanceZero}>Settled up</Text>;
        } else if (balance > 0) {
            return <Text style={styles.balancePositive}>You're owed ${balance.toFixed(2)}</Text>;
        } else {
            return <Text style={styles.balanceNegative}>You owe ${Math.abs(balance).toFixed(2)}</Text>;
        }
    };

    const renderGroup = (group) => (
        <TouchableOpacity key={group.id} style={styles.groupItem} onPress={() => handleGroupPress(group)}>
            <LinearGradient
                colors={[group.color + '15', group.color + '08']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.groupGradient}
            >
                <View style={styles.groupContent}>
                    <View style={styles.groupMainInfo}>
                        <View style={[styles.groupIcon, { backgroundColor: group.color }]}>
                            <Text style={styles.groupIconText}>{group.icon}</Text>
                        </View>
                        <View style={styles.groupDetails}>
                            <Text style={styles.groupName}>{group.name}</Text>
                            {group.description && (
                                <Text style={styles.groupDescription}>{group.description}</Text>
                            )}
                            <View style={styles.groupMetaInfo}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="people" size={14} color="#6B7280" />
                                    <Text style={styles.metaText}>{group.memberCount} members</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Ionicons name="time" size={14} color="#6B7280" />
                                    <Text style={styles.metaText}>{group.lastActivity}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.groupBalance}>
                        <Text style={styles.totalBalance}>${group.totalBalance.toFixed(2)} total</Text>
                        {renderBalanceText(group.userBalance, group.totalBalance)}
                        <View style={styles.chevron}>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#1654b0" />
                <SafeAreaView style={styles.safeAreaTop}>
                    <View style={styles.searchContainer}>
                        <View style={styles.searchInputWrapper}>
                            <Ionicons name="search" size={24} color="#1654b0" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search groups..."
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.createButtonGradient}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.createGroupText}>Create</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

            <View style={styles.contentContainer}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {groupInvites.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeaderContainer}>
                                    <Text style={styles.sectionHeader}>
                                        Group Invitations
                                    </Text>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{groupInvites.length}</Text>
                                    </View>
                                </View>
                                <View style={styles.sectionContent}>
                                    {groupInvites.map(renderGroupInvite)}
                                </View>
                            </View>
                        )}

                        <View style={styles.section}>
                            <View style={styles.sectionHeaderContainer}>
                                <Text style={styles.sectionHeader}>
                                    Your Groups
                                </Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{filteredGroups.length}</Text>
                                </View>
                            </View>
                            <View style={styles.sectionContent}>
                                {filteredGroups.length > 0 ? (
                                    filteredGroups.map(renderGroup)
                                ) : (
                                    <View style={styles.emptyState}>
                                        <LinearGradient
                                            colors={['#F3F4F6', '#E5E7EB']}
                                            style={styles.emptyIconContainer}
                                        >
                                            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                                        </LinearGradient>
                                        <Text style={styles.emptyStateText}>
                                            {searchQuery ? 'No groups match your search' : 'No groups yet'}
                                        </Text>
                                        <Text style={styles.emptyStateSubtext}>
                                            {searchQuery ? 'Try a different search term' : 'Create a group to start sharing expenses!'}
                                        </Text>
                                        {!searchQuery && (
                                            <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateGroup}>
                                                <LinearGradient
                                                    colors={['#1654b0', '#4F46E5']}
                                                    style={styles.emptyButtonGradient}
                                                >
                                                    <Text style={styles.emptyButtonText}>Create Your First Group</Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    statusBarGradient: {
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    safeAreaTop: {
        paddingTop: 0,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    searchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 16,
        gap: 12,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingVertical: 12,
        paddingLeft: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    createGroupButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 6,
    },
    createGroupText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    scrollView: {
        flex: 1,
        paddingTop: 24,
    },
    section: {
        marginBottom: 32,
        paddingHorizontal: 16,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    badge: {
        backgroundColor: '#1654b0',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 24,
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionContent: {
        gap: 12,
    },
    inviteItem: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inviteGradient: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inviteContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    inviteInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    inviteDetails: {
        flex: 1,
    },
    inviteGroupName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    inviteText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 6,
    },
    inviterName: {
        fontWeight: '600',
        color: '#1654b0',
    },
    inviteMetaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    inviteMemberCount: {
        fontSize: 12,
        color: '#6B7280',
    },
    inviteActions: {
        flexDirection: 'row',
        gap: 8,
    },
    groupItem: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    groupGradient: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    groupContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    groupMainInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    groupIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    groupIconText: {
        fontSize: 24,
    },
    groupDetails: {
        flex: 1,
    },
    groupName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    groupDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    groupMetaInfo: {
        flexDirection: 'row',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    groupBalance: {
        alignItems: 'flex-end',
        paddingLeft: 16,
    },
    totalBalance: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    chevron: {
        marginTop: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    acceptButton: {
        backgroundColor: '#10B981',
    },
    declineButton: {
        backgroundColor: '#EF4444',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyStateButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#1654b0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    emptyButtonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    balanceZero: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '600',
        marginTop: 2,
    },
    balancePositive: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '600',
        marginTop: 2,
    },
    balanceNegative: {
        fontSize: 14,
        color: '#EF4444',
        fontWeight: '600',
        marginTop: 2,
    },
});

export default GroupScreen;