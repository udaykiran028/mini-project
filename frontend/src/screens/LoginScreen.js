import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, Image, StyleSheet, TouchableOpacity,
  TextInput, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { auth } from "../../config/FirebaseConfig";
import { ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useUser } from "../../context/UserContext"; // Import the context
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../screens/lecturer/LecturerDashboard"; // Adjust the import based on your project structure

const LoginScreen = ({ navigation }) => {
  const [userType, setUserType] = useState('lecturer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useUser();

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setLoading(true);

    let valid = true;

    if (!email.trim()) {
      setEmailError("Please enter your email");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password");
      valid = false;
    }

    if (!valid) {
      setLoading(false);
      return;
    }

    console.log("Attempting login with:", email, password); // Debugging log

    try {
      let sentdata = {
        email: email,
        userType: userType,
      };
      console.log("Sent Data to Server:", sentdata);
      const response = await fetch(`http://${API_BASE_URL}:5000/checkUserInfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sentdata),
      });

      const data = await response.json();
      console.log("Response from server:", data);

      if (!data.exists) {
        setGeneralError("No data found");
        return;
      }

      console.log(data.data);
      loginUser(userType, data.data);

      // Debugging logs before authentication
      console.log("Signing in with email:", email.length);
      console.log("Signing in with password:", password.length);


      await signInWithEmailAndPassword(auth, email, password);

      await AsyncStorage.setItem("userType", userType);
      await AsyncStorage.setItem("userData", JSON.stringify(data.data));

      navigation.replace(userType === "lecturer" ? "LecturerDashboard" : "StudentDashboard");
 
    } catch (error) {
      console.log("Error checking user:", error);

      if (error.code === "auth/invalid-credential") {
        setGeneralError("Invalid email or password");
      } else {
        setGeneralError("Something went wrong, please try again.");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C4EF2" />
        </View>
      ) : (

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#ffff' }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', height: "35%", paddingTop: 20 }}>
              <Image source={require('../assets/students.jpeg')} style={styles.image} />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.title}>
                {userType === 'lecturer' ? 'Lecturer Login' : 'Student Login'}
              </Text>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError(''); // Clear error when user types
                }}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(''); // Clear error when user types
                }}
              />
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassword}>Forgot your password?</Text>
              </TouchableOpacity>

              {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>


              <TouchableOpacity onPress={() => setUserType(userType === 'lecturer' ? 'student' : 'lecturer')}>
                <Text style={styles.loginChange}>
                  {userType === 'lecturer' ? 'Login as Student' : 'Login as Lecturer'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      )}
    </>

  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "130%",
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D0C57",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "bold",
    marginLeft: 5,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#F7F7F7",
    marginBottom: 5,
    color: "#333",
  },
  button: {
    backgroundColor: "#6C4EF2",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    color: "#6C4EF2",
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 5,
  },
  generalError: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  loginChange: {
    color: "navy",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
});
