import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function NavigationBar(props) {
    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                switch (route.name) {
                    case 'Friends':
                        iconName = focused ? 'people' : 'people-outline';
                        break;
                    case 'Groups':
                        iconName = focused ? 'people-circle' : 'people-circle-outline';
                        break;
                    case 'Calculate':
                        iconName = focused ? 'calculator' : 'calculator-outline';
                        break;
                    case 'Scan':
                        iconName = focused ? 'scan' : 'scan-outline';
                        break;
                    case 'Profile':
                        iconName = focused ? 'person' : 'person-outline';
                        break;
                }
                return <Ionicons name={iconName} size={size} color={color} />;
            },
        })}>
            <Tab.Screen name="Friends" component={FriendsScreen} />
            <Tab.Screen name="Groups" component={GroupScreen} />
            <Tab.Screen name="Calculate" component={CalculateScreen} />
            <Tab.Screen name="Scan" component={ScanScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default NavigationBar;