import React, { useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../Hooks/authContext';
import { TextInput } from 'react-native';
import { TouchableOpacity } from 'react-native';

function SignInScreen(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, loading } = useAuth();

    const handleSignIn = async () => {
        try {
            await signIn({ email, password });  
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, padding: 20 }}>
            <Text>Sign In</Text>
            
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
                onPress={handleSignIn} 
                disabled={loading}
                style={{ backgroundColor: 'blue', padding: 15, alignItems: 'center' }}
            >
                <Text style={{ color: 'white' }}>
                    {loading ? 'Signing In...' : 'Sign In'}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

export default SignInScreen;