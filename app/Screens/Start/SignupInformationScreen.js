import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../Hooks/authContext';
import { supabase } from '../../lib/supabase';

function SignupInformationScreen(props) {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const { user, completeProfile } = useAuth();

    const handleCompleteSetup = async () => {
        if (!name.trim() || !username.trim()) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
        try {
            const { error } = await supabase
                .from('users')
                .update({ name: name, username: username })
                .eq('id', user.id);
            if (error) {
                Alert.alert('Error', error.message);
                return;
            }
            await completeProfile();
        } catch (error) {
            console.error('Error completing profile:', error);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                Complete Your Profile
            </Text>

            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
            />
            
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
            />

            <TouchableOpacity
                onPress={handleCompleteSetup}
                style={{ backgroundColor: 'blue', padding: 15, alignItems: 'center' }}
            >
                <Text style={{ color: 'white' }}>Complete Setup</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

export default SignupInformationScreen;