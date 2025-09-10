import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

function SignUpScreen(props) {
    return (
        <SafeAreaView>
            <StatusBar style="dark" />
            <View>
                <Text>Sign Up</Text>
            </View>
        </SafeAreaView>
    );
}

export default SignUpScreen;