import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import SearchBarComponent from '../../../Components/SearchBarComponet';
import { supabase } from '../../../lib/supabase';

const GROUP_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const GROUP_ICONS = [
    '🏠', '✈️', '🍔', '🎉', '💼', '🍻', '📚', '🚗', '🎮', '🛒'
];

function CreateGroupScreen(props) {
    const navigation = useNavigation();
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState(GROUP_COLORS[0]);
    const [selectedIcon, setSelectedIcon] = useState(GROUP_ICONS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [addedUsers, setAddedUsers] = useState([]);

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert('Error', 'Please enter a group name');
            return;
        }

        setIsLoading(true);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
        
            if (userError || !user) {
                throw new Error('Not authenticated');
            }

            const { data, error } = await supabase
                .from('groups')
                .insert([
                    {
                        name: groupName.trim(),
                        description: groupDescription.trim(),
                        color: selectedColor,
                        icon: selectedIcon,
                        created_by: user.id,
                    }
                ])
                .select()
                .single();
            if (error) {
                throw error;
            }
            const groupId = data.id;
            if (addedUsers.length >= 0) {
                const membersToAdd = [
                    {
                        group_id: groupId,
                        member_id: user.id,
                        role: 'admin',
                        status: 'accepted',
                        joined_at: new Date().toISOString(),
                    },
                    ...addedUsers.map(addedUser => ({
                        group_id: groupId,
                        member_id: addedUser.id,
                        role: 'member',
                        status: 'pending',
                    }))
                ];

                console.log(membersToAdd);
                const { error: membersError } = await supabase
                    .from('group_members')
                    .insert(membersToAdd);

                if (membersError) {
                    throw new Error('Failed to add some members to the group');
                }
            }

            Alert.alert('Success', 'Group created successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                }
            ]);
        } catch (error) {
            console.error('Error creating group:', error);
            Alert.alert('Error', 'Failed to create group. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const renderAddedUser = ({ item }) => (
        <View style={styles.addedUserItem}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.name || 'No Name'}</Text>
                    {item.username && (
                        <Text style={styles.userHandle}>@{item.username}</Text>
                    )}
                </View>
            </View>
            
            <TouchableOpacity 
                onPress={() => onRemoveUser(item)}
                style={styles.removeButton}
            >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    const addUserToGroup = (user) => {
        if (addedUsers.find(u => u.id === user.id)) {
            Alert.alert('User already added', `${user.name} is already in the group.`);
            return;
        }
        setAddedUsers((prevUsers) => [...prevUsers, user]);
    }

    const onRemoveUser = (user) => {
        setAddedUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
    }

    const renderAddMembers = () => (
        <View style={styles.addMembersUnifiedContainer}>
            <Text style={styles.sectionTitle}>Add Members</Text>
            <View style={styles.addMembersContainer}>
                <SearchBarComponent onUserSelect={addUserToGroup} isGroupMode={true} addedUsers={addedUsers} />
            </View>
            {addedUsers.length > 0 && (
                <View style={styles.addedUsersListSection}>
                    <Text style={styles.addedUsersTitle}>Added Members ({addedUsers.length})</Text>
                    <FlatList
                        data={addedUsers}
                        keyExtractor={(item) => item.id}
                        renderItem={renderAddedUser}
                        style={styles.addedUsersList}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                    />
                </View>
            )}
        </View>
    );

    const renderColorPicker = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Color</Text>
            <View style={styles.colorGrid}>
                {GROUP_COLORS.map((color) => (
                    <TouchableOpacity
                        key={color}
                        style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            selectedColor === color && styles.selectedColorOption
                        ]}
                        onPress={() => setSelectedColor(color)}
                    >
                        {selectedColor === color && (
                            <Ionicons name="checkmark" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderIconPicker = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Icon</Text>
            <View style={styles.iconGrid}>
                {GROUP_ICONS.map((icon) => (
                    <TouchableOpacity
                        key={icon}
                        style={[
                            styles.iconOption,
                            selectedIcon === icon && {
                                backgroundColor: selectedColor + '20',
                                borderColor: selectedColor,
                                borderWidth: 2
                            }
                        ]}
                        onPress={() => setSelectedIcon(icon)}
                    >
                        <Text style={styles.iconText}>{icon}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderPreview = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewContainer}>
                <LinearGradient
                    colors={[selectedColor + '15', selectedColor + '08']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.previewCard}
                >
                    <View style={styles.previewContent}>
                        <View style={[styles.previewIcon, { backgroundColor: selectedColor }]}>
                            <Text style={styles.previewIconText}>{selectedIcon}</Text>
                        </View>
                        <View style={styles.previewDetails}>
                            <Text style={styles.previewName}>
                                {groupName || 'Group Name'}
                            </Text>
                            <Text style={styles.previewDescription}>
                                {groupDescription || 'Group description'}
                            </Text>
                            <View style={styles.previewMeta}>
                                <Ionicons name="people" size={14} color="#6B7280" />
                                <Text style={styles.previewMetaText}>{addedUsers.length + 1} members</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <LinearGradient
                    colors={['#1654b0', '#4F46E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Create Group</Text>
                        <View style={styles.headerButton} />
                    </View>
                </LinearGradient>

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Group Name *</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter group name"
                                    placeholderTextColor="#9CA3AF"
                                    value={groupName}
                                    onChangeText={setGroupName}
                                    maxLength={50}
                                />
                                <View style={styles.inputIcon}>
                                    <Ionicons name="people" size={20} color="#6B7280" />
                                </View>
                            </View>
                            <Text style={styles.characterCount}>{groupName.length}/50</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.textInput, styles.textArea]}
                                    placeholder="What's this group for?"
                                    placeholderTextColor="#9CA3AF"
                                    value={groupDescription}
                                    onChangeText={setGroupDescription}
                                    multiline
                                    numberOfLines={3}
                                    maxLength={200}
                                    textAlignVertical="top"
                                />
                                <View style={[styles.inputIcon, styles.textAreaIcon]}>
                                    <Ionicons name="document-text" size={20} color="#6B7280" />
                                </View>
                            </View>
                            <Text style={styles.characterCount}>{groupDescription.length}/200</Text>
                        </View>

                        {renderAddMembers()}
                        {renderColorPicker()}
                        {renderIconPicker()}
                        {renderPreview()}

                        <View style={styles.actionSection}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleCancel}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.createButton,
                                    (!groupName.trim() || isLoading) && styles.createButtonDisabled
                                ]}
                                onPress={handleCreateGroup}
                                disabled={!groupName.trim() || isLoading}
                            >
                                <LinearGradient
                                    colors={
                                        !groupName.trim() || isLoading
                                            ? ['#9CA3AF', '#6B7280']
                                            : ['#10B981', '#059669']
                                    }
                                    style={styles.createButtonGradient}
                                >
                                    {isLoading ? (
                                        <View style={styles.loadingContainer}>
                                            <Ionicons name="hourglass" size={20} color="#fff" />
                                            <Text style={styles.createButtonText}>Creating...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <Ionicons name="add-circle" size={20} color="#fff" />
                                            <Text style={styles.createButtonText}>Create Group</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    addMembersContainer: {
        padding: 0,
        elevation: 2,
    },
    addMembersUnifiedContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 24,
    },
    addedUsersListSection: {
        marginTop: 2,
    },
    addedUsersTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    addedUsersList: {
        maxHeight: 200,
    },
    addedUserItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    userDetails: {
        flex: 1,
    },
    userInfo: {
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
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    userHandle: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    removeButton: {
        padding: 4,
    },
    inputContainer: {
        position: 'relative',
        borderRadius: 16,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    textInput: {
        fontSize: 16,
        color: '#1F2937',
        paddingVertical: 16,
        paddingLeft: 16,
        paddingRight: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 80,
        paddingTop: 16,
    },
    inputIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    textAreaIcon: {
        top: 16,
    },
    characterCount: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'right',
        marginTop: 4,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedColorOption: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        transform: [{ scale: 1.1 }],
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    iconText: {
        fontSize: 24,
    },
    previewContainer: {
        marginBottom: 8,
    },
    previewCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    previewContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    previewIcon: {
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
    previewIconText: {
        fontSize: 24,
    },
    previewDetails: {
        flex: 1,
    },
    previewName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    previewDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    previewMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    previewMetaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    actionSection: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 24,
        paddingBottom: 40,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    createButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    createButtonDisabled: {
        shadowOpacity: 0.1,
        elevation: 2,
    },
    createButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default CreateGroupScreen;