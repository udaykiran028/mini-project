import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useUser } from "../../../context/UserContext"; // Import the context
import CircularProgress from "../CircularProgress"; // Import the component
import { getAuth, signOut } from "firebase/auth";

const StudentDashboard = ({navigation}) => {
  const { student } = useUser(); // Assuming you have a user context to get student info
  const [totalClasses, setTotalClasses] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const { logoutUser } = useUser(); // Function to clear user data from context
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/student-api/total-classes`);
        const data = await response.json();
        console.log("Sent Data to Server:", student); // Debugging log
        console.log("Response from server:", data);

        if (data.success) {
          setTotalClasses(data.total_classes); // Assuming API returns total classes
          let per = (student.Classes.Present / data.total_classes) * 100; // Calculate attendance percentage
          setPercentage(per);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth); // Logs out the user
      logoutUser(); // Clear user data from context
      console.log("User logged out");
      navigation.replace("LoginScreen"); // Navigate to Login screen
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome {student.Name}</Text>

      {/* Circular Progress */}
      <CircularProgress percentage={percentage.toFixed(2)} />

      {/* Row for Total & Present Classes */}
      <View style={styles.classRow}>
        <Text style={styles.classText}>Total Classes: {totalClasses}</Text>
        <Text style={styles.classText}>Present: {student.Classes.Present}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },
  welcomeText: {
    fontWeight: "bold",
    color: "#2D0C57",
    fontSize: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    position: "absolute", // Positions it on top
    right: 15, // Aligns to the right
    top: 10, // Adjusts vertical position
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  logoutText: {
    fontSize: 14,
    color: "red",
    fontWeight: "bold",
  },
  classRow: {
    flexDirection: "row", // Ensures row alignment
    justifyContent: "space-between",
    width: "80%", // Adjust width as needed
    marginTop: 10,
  },
  classText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default StudentDashboard;
