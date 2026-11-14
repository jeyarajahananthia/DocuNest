
import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Main screens
import HomeScreen from '../screens/HomeScreen';
import AllDocumentsScreen from '../screens/AllDocumentsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CreateDocumentScreen from '../screens/CreateDocumentScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Other screens
import AddDocumentScreen from '../screens/AddDocumentScreen';
import CategoryDocumentsScreen from '../screens/CategoryDocumentsScreen';
import DocumentDetailsScreen from '../screens/DocumentDetailsScreen';
import EditDocumentScreen from '../screens/EditDocumentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ========================================
// BOTTOM TAB NAVIGATION
// ========================================

function BottomTabs({ onLogout }) {
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

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7E9',
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },

        tabBarItemStyle: {
          flex: 1,
        },

        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;

            case 'Documents':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;

            case 'Categories':
              iconName = focused ? 'folder' : 'folder-outline';
              break;

            case 'Create':
              iconName = focused ? 'create' : 'create-outline';
              break;

            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;

            default:
              iconName = 'ellipse-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'DocuNest',
          tabBarLabel: 'Home',
        }}
      />

      <Tab.Screen
        name="Documents"
        component={AllDocumentsScreen}
        options={{
          title: 'All Documents',
          tabBarLabel: 'Documents',
        }}
      />

      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: 'Categories',
          tabBarLabel: 'Categories',
        }}
      />

      <Tab.Screen
        name="Create"
        component={CreateDocumentScreen}
        options={{
          title: 'Create Document',
          tabBarLabel: 'Create',
        }}
      />

      <Tab.Screen
        name="Settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      >
        {(props) => (
          <SettingsScreen
            {...props}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>

      {/* HIDDEN TAB ROUTES */}

      <Tab.Screen
        name="ImportDocument"
        component={AddDocumentScreen}
        options={{
          title: 'Import Document',
          tabBarButton: () => null,
        }}
      />

      <Tab.Screen
        name="CategoryDocuments"
        component={CategoryDocumentsScreen}
        options={{
          title: 'Category Documents',
          tabBarButton: () => null,
        }}
      />

    </Tab.Navigator>
  );
}

// ========================================
// MAIN STACK NAVIGATION
// ========================================

export default function AppNavigator({ onLogout }) {
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
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <BottomTabs
            {...props}
            onLogout={onLogout}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="DocumentDetails"
        component={DocumentDetailsScreen}
        options={{
          title: 'Document Details',
        }}
      />

      <Stack.Screen
        name="EditDocument"
        component={EditDocumentScreen}
        options={{
          title: 'Edit Document',
        }}
      />

    </Stack.Navigator>
  );
}
