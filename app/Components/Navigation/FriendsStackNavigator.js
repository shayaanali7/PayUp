import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FriendsScreen from '../../Screens/ApplicationScreens/FriendsScreen/FriendsScreen';
import AddFriendsScreen from '../../Screens/ApplicationScreens/FriendsScreen/AddFriendScreen';
import FriendProfileScreen from '../../Screens/ApplicationScreens/FriendsScreen/FriendProfileScreen';

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
            <Stack.Screen 
                name="FriendProfileScreen" 
                component={FriendProfileScreen} 
                options={({ route }) => ({ 
                    title: route.params?.userName || 'Profile',
                    headerShown: false // Since we have custom header
                })}
            />
        </Stack.Navigator>
    );
}

export default FriendsStackNavigator;