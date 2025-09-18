import React, { useState } from 'react';
import { Alert, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../Hooks/authContext';
import { TouchableOpacity } from 'react-native';

function SignUpScreen(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUp, loading } = useAuth();

    const handleSignUp = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        try {
            await signUp({ email, password });
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    return (
            <SafeAreaView style={{ flex: 1, padding: 20 }}>
                <Text>Sign Up</Text>
                
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                />

                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                />
                
                <TouchableOpacity
                    onPress={handleSignUp} 
                    disabled={loading}
                    style={{ backgroundColor: 'blue', padding: 15, alignItems: 'center' }}
                >
                    <Text style={{ color: 'white' }}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => props.navigation.goBack()} 
                    disabled={loading}
                    style={{ backgroundColor: 'blue', padding: 15, marginTop: 10, alignItems: 'center' }}
                >
                    <Text style={{ color: 'white' }}>
                        Go back
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
}

export default SignUpScreen;