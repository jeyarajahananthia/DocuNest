
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddDocumentScreen from '../screens/AddDocumentScreen';

import HomeScreen from '../screens/HomeScreen';
import AllDocumentsScreen from '../screens/AllDocumentsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import SearchScreen from '../screens/SearchScreen';
import DocumentDetailsScreen from '../screens/DocumentDetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditDocumentScreen from '../screens/EditDocumentScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
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
        name="Home"
        component={HomeScreen}
        options={{ title: 'DocuNest' }}
      />

      <Stack.Screen
        name="AllDocuments"
        component={AllDocumentsScreen}
        options={{ title: 'All Documents' }}
      />

      <Stack.Screen
        name="AddDocument"
        component={AddDocumentScreen}
        options={{ title: 'Import Document' }}
      />

      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />

      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Search Documents' }}
      />

      <Stack.Screen
        name="DocumentDetails"
        component={DocumentDetailsScreen}
        options={{ title: 'Document Details' }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />

      <Stack.Screen
        name="EditDocument"
        component={EditDocumentScreen}
        options={{ title: 'Edit Document' }}
      />

    </Stack.Navigator>

    
  );
}
