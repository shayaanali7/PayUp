import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FriendsScreen from '../../Screens/ApplicationScreens/FriendsScreen/FriendsScreen';
import AddFriendsScreen from '../../Screens/ApplicationScreens/FriendsScreen/AddFriendScreen';

const Stack = createStackNavigator();

function FriendsStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="FriendsList" component={FriendsScreen} />
            <Stack.Screen 
                name="AddFriendsScreen" 
                component={AddFriendsScreen}
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    );
}

export default FriendsStackNavigator;