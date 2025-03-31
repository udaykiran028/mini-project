import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProvider, useUser } from "./context/UserContext";
import LoginScreen from "./src/screens/LoginScreen";
import StudentDashboard from "./src/screens/student/StudentDashboard";
import LecturerDashboard from "./src/screens/lecturer/LecturerDashboard";
import ForgotPassword from "./src/screens/ForgotPassword";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/FirebaseConfig"; // Ensure the path is correct

import { View, ActivityIndicator } from "react-native";

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { student, lecturer, setStudent, setLecturer } = useUser();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkStoredUser = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem("userType");
        const storedUserData = await AsyncStorage.getItem("userData");

        if (storedUserType && storedUserData) {
          const userData = JSON.parse(storedUserData);
          if (storedUserType === "student") {
            setStudent(userData);
          } else if (storedUserType === "lecturer") {
            setLecturer(userData);
          }
        }
      } catch (error) {
        console.log("Error loading stored user data:", error);
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        checkStoredUser();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!student && !lecturer ? (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
        </>
      ) : student ? (
        <Stack.Screen name="StudentDashboard" component={StudentDashboard} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="LecturerDashboard" component={LecturerDashboard} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}
