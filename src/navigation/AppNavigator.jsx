
import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Main screens
import HomeScreen from '../screens/HomeScreen';
import AllDocumentsScreen from '../screens/AllDocumentsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CreateDocumentScreen from '../screens/CreateDocumentScreen';

// Other screens
import AddDocumentScreen from '../screens/AddDocumentScreen';
import DocumentDetailsScreen from '../screens/DocumentDetailsScreen';
import EditDocumentScreen from '../screens/EditDocumentScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ========================================
// BOTTOM TAB NAVIGATION
// ========================================

function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,

        headerStyle: {
          backgroundColor: '#34495E',
        },

        headerTintColor: '#FFFFFF',

        headerTitleStyle: {
          fontWeight: 'bold',
        },

        tabBarActiveTintColor: '#3498DB',
        tabBarInactiveTintColor: '#7F8C8D',

        // Bottom tab bar styling
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
          paddingHorizontal: 0,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7E9',
          width: '100%',
        },

        // Tab label styling
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },

        // Equal width for four visible tabs
        tabBarItemStyle: {
          flex: 1,
          width: '25%',
        },

        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Documents') {
            iconName = focused
              ? 'document-text'
              : 'document-text-outline';
          } else if (route.name === 'Categories') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'create' : 'create-outline';
          }

          return iconName ? (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          ) : null;
        },
      })}
    >

      {/* Visible bottom tabs */}

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'DocuNest' }}
      />

      <Tab.Screen
        name="Documents"
        component={AllDocumentsScreen}
        options={{ title: 'All Documents' }}
      />

      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />

      <Tab.Screen
        name="Create"
        component={CreateDocumentScreen}
        options={{ title: 'Create Document' }}
      />

      {/* Hidden route: bottom tabs remain visible */}

      <Tab.Screen
        name="ImportDocument"
        component={AddDocumentScreen}
        options={{
          title: 'Import Document',
          tabBarButton: () => null,
        }}
      />

    </Tab.Navigator>
  );
}

// ========================================
// MAIN STACK NAVIGATION
// ========================================

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#34495E',
        },

        headerTintColor: '#FFFFFF',

        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >

      <Stack.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="DocumentDetails"
        component={DocumentDetailsScreen}
        options={{ title: 'Document Details' }}
      />

      <Stack.Screen
        name="EditDocument"
        component={EditDocumentScreen}
        options={{ title: 'Edit Document' }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />

    </Stack.Navigator>
  );
}
