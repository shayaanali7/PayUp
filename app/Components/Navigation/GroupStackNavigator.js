import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GroupScreen from '../../Screens/ApplicationScreens/GroupsScreen/GroupScreen';
import CreateGroupScreen from '../../Screens/ApplicationScreens/GroupsScreen/CreateGroupScreen';

const Stack = createStackNavigator();

function GroupStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GroupScreen" component={GroupScreen} />
            <Stack.Screen 
                name="CreateGroupScreen" 
                component={CreateGroupScreen}
                options={{
                    headerShown: false,
                }}
            />
            {/*
            <Stack.Screen 
                name="FriendProfileScreen" 
                component={FriendProfileScreen} 
                options={({ route }) => ({ 
                    title: route.params?.userName || 'Profile',
                    headerShown: false
                })}
            />
            */}
        </Stack.Navigator>
    );
}

export default GroupStackNavigator;