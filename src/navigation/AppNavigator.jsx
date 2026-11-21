
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

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
// TAB CONFIGURATION
// ========================================

const tabItems = {
  Home: {
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
  },

  Documents: {
    label: 'Documents',
    icon: 'document-text-outline',
    activeIcon: 'document-text',
  },

  Categories: {
    label: 'Categories',
    icon: 'folder-outline',
    activeIcon: 'folder',
  },

  Create: {
    label: 'Create',
    icon: 'create-outline',
    activeIcon: 'create',
  },

  Settings: {
    label: 'Settings',
    icon: 'settings-outline',
    activeIcon: 'settings',
  },
};

// ========================================
// CUSTOM BOTTOM TAB BAR
// ========================================

function CustomTabBar({ state, descriptors, navigation }) {

  // Only display the five main tabs
  const visibleRoutes = state.routes.filter(
    route => tabItems[route.name]
  );

  return (
    <View style={styles.tabBarContainer}>

      {visibleRoutes.map((route) => {

        const focused =
          state.routes[state.index].key === route.key;

        const tab = tabItems[route.name];

        const color = focused ? '#3498DB' : '#7F8C8D';

        const onPress = () => {

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            style={styles.tabItem}
          >

            <Ionicons
              name={focused ? tab.activeIcon : tab.icon}
              size={23}
              color={color}
            />

            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                { color: color },
              ]}
            >
              {tab.label}
            </Text>

          </Pressable>
        );
      })}

    </View>
  );
}

// ========================================
// BOTTOM TAB NAVIGATION
// ========================================

function BottomTabs({ onLogout }) {

  return (
    <Tab.Navigator
      initialRouteName="Home"

      tabBar={(props) => (
        <CustomTabBar {...props} />
      )}

      screenOptions={{
        headerShown: true,

        headerStyle: {
          backgroundColor: '#34495E',
        },

        headerTintColor: '#FFFFFF',

        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >

      {/* MAIN TABS */}

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'DocuNest',
        }}
      />

      <Tab.Screen
        name="Documents"
        component={AllDocumentsScreen}
        options={{
          title: 'All Documents',
        }}
      />

      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: 'Categories',
        }}
      />

      <Tab.Screen
        name="Create"
        component={CreateDocumentScreen}
        options={{
          title: 'Create Document',
        }}
      />

      <Tab.Screen
        name="Settings"
        options={{
          title: 'Settings',
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
        }}
      />

      <Tab.Screen
        name="CategoryDocuments"
        component={CategoryDocumentsScreen}
        options={{
          title: 'Category Documents',
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

      {/* MAIN APPLICATION */}

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

      {/* DOCUMENT DETAILS */}

      <Stack.Screen
        name="DocumentDetails"
        component={DocumentDetailsScreen}
        options={{
          title: 'Document Details',
        }}
      />

      {/* EDIT DOCUMENT */}

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

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({

  // Main bottom navigation container
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    width: '100%',
    height: 65,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E5E7E9',

    paddingTop: 5,
    paddingBottom: 5,

    elevation: 8,
  },

  // Each tab takes an equal share of available width
  tabItem: {
    flex: 1,
    width: '20%',
    minWidth: 0,

    height: '100%',

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 2,
  },

  // Tab text
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },

});
