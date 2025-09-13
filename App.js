import { StatusBar } from 'expo-status-bar';
import WelcomeScreen from './app/Screens/Start/WelcomeScreen';
import SignUpScreen from './app/Screens/Start/SignUpScreen';
import SignInScreen from './app/Screens/Start/SignInScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './app/Hooks/authContext';
import NavigationBar from './app/Components/NavigationBar';

const Stack = createStackNavigator();

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} /> 
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={NavigationBar} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {

  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
