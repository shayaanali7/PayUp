import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, SafeAreaView, View, Image, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

function WelcomeScreen({ navigation }) {
    const handleSignUp = () => {
        navigation.navigate('SignUp');
    }

    const handleSignIn = () => {
        navigation.navigate('SignIn');
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <StatusBar style="light" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image 
                            style={styles.logo} 
                            source={require('../assets/favicon.png')} 
                        />
                    </View>
                    <Text style={styles.title}>PayUp</Text>
                    <Text style={styles.subtitle}>
                        Split, Track and Calculate expenses with friends easily
                    </Text>
                </View>

                <View style={styles.buttonSection}>
                    <TouchableOpacity 
                        style={styles.signUpButton} 
                        onPress={handleSignUp}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.signUpButtonText}>Get Started</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.signInButton} 
                        onPress={handleSignIn}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.signInButtonText}>I already have an account</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Free • Secure • Easy to use
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        position: 'relative',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 30,
        alignItems: 'center',
        zIndex: 2,
    },
    logoContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#1E293B',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#3B82F6',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 2,
        borderColor: '#3B82F6',
    },
    logo: {
        width: 60,
        height: 60,
        tintColor: '#60A5FA',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    subtitle: {
        color: '#CBD5E1',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
        fontWeight: '500',
        maxWidth: width * 0.85
    },
    decorativeSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    buttonSection: {
        marginTop: 120,
        paddingHorizontal: 30,
        paddingBottom: 40,
        gap: 16,
        zIndex: 2,
    },
    signUpButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 18,
        paddingHorizontal: 30,
        borderRadius: 16,
        shadowColor: '#3B82F6',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
        borderColor: '#60A5FA',
    },
    signUpButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    signInButton: {
        backgroundColor: 'transparent',
        paddingVertical: 18,
        paddingHorizontal: 30,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#60A5FA',
        shadowColor: '#1E3A8A',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    signInButtonText: {
        color: '#DBEAFE',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    footer: {
        paddingBottom: 30,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#93C5FD',
        textAlign: 'center',
        fontWeight: '500',
    },
})

export default WelcomeScreen;