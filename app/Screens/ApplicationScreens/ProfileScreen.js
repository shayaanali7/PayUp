import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, View } from 'react-native';
import { useAuth } from '../../Hooks/authContext';
import { SafeAreaView } from 'react-native-safe-area-context';

function ProfileScreen(props) {
    const { signOut } = useAuth();

    const signOutHandle = () => {
        signOut();
    }

    return (
        <SafeAreaView>
            <View>
            <Text>Profile Screen</Text>
            <TouchableOpacity onPress={(() => {signOutHandle()})}>
                <Text>Sign Out</Text>
            </TouchableOpacity>
        </View>
        </SafeAreaView>
        
    );
}

export default ProfileScreen;