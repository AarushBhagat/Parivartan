import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import IntroScreen from './src/screens/IntroScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReportIssueScreen from './src/screens/ReportIssueScreen';
import IssueDetailScreen from './src/screens/IssueDetailScreen';
import MapScreen from './src/screens/MapScreen';
import MyComplaintsScreen from './src/screens/MyComplaintsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import StaffDashboardScreen from './src/screens/StaffDashboardScreen';

// Auth Provider
import { AuthProvider } from './src/contexts/AuthContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Report" component={ReportIssueScreen} />
          <Stack.Screen name="IssueDetail" component={IssueDetailScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="MyComplaints" component={MyComplaintsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Community" component={CommunityScreen} />
          <Stack.Screen name="StaffDashboard" component={StaffDashboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
