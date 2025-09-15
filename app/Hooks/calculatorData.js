import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./authContext";

export const saveCalculatorData = async (userId, data) => {
    try {
        if (!userId) return;
        await AsyncStorage.setItem(`calculatorData_${userId}`, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving calculator data:', error);
    }
}

export const getCalculatorData = async (userId) => {
    try {
        if (!userId) return;
        const data = await AsyncStorage.getItem(`calculatorData_${userId}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error retrieving calculator data:', error);
    }
}

export const handleClearData = async (userId) => {
    try {
        if (!userId) return;
        await AsyncStorage.removeItem(`calculatorData_${userId}`);
    } catch (error) {
        console.error('Error clearing calculator data:', error);
    }
}