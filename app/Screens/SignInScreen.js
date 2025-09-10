import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function SignInScreen(props) {
    return (
        <SafeAreaView>
            <StatusBar style="dark" />
            <View>
                <Text>Sign In</Text>
            </View>
        </SafeAreaView>
    );
}

export default SignInScreen;