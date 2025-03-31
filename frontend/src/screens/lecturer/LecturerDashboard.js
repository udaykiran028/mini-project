import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { PERMISSIONS, request, check, RESULTS } from "react-native-permissions";
import { Platform } from "react-native";
import { useUser } from "../../../context/UserContext";
import CustomCheckbox from "../CustomCheckbox"; // Import the component
import { getAuth, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";


const LecturerDashboard = ({ navigation }) => {
  const { lecturer, logoutUser } = useUser();
  const [imageUri, setImageUri] = useState(null);
  const [detectedStudents, setDetectedStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState({});
  const [attendanceId, setAttendenceId] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 

  const selectImage = () => {
    const options = { mediaType: "photo", quality: 1, saveToPhotos: true };
    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
        handleUpload(response.assets[0].uri);
      }
    });
  };

  const requestCameraPermission = async () => {
    const permission =
      Platform.OS === "android"
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA;

    const result = await check(permission);

    if (result === RESULTS.DENIED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }

    return result === RESULTS.GRANTED;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.log("Camera permission denied");
      return;
    }

    const options = { mediaType: "photo", quality: 1, saveToPhotos: true };
    launchCamera(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri);
        handleUpload(response.assets[0].uri);
      }
    });
  };

  const handleUpload = async (uri) => {
    console.log("lecturer", lecturer);
    setLoading(true);

    const formData = new FormData();
    formData.append("image", { uri, type: "image/jpeg", name: "photo.jpg" });
    formData.append("lecture_id", lecturer.Lecturer_ID);
    formData.append("subject", lecturer.Courses_Code[0]);
    console.log("after formData", formData);

    try {
      const response = await fetch(
        `${API_BASE_URL}/lecturer-api/upload-attendance`,
        {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const data = await response.json();
      console.log("data", data);
      if (!data.success) {
        alert("Error uploading image. Please try again.");
        return;
      }
      alert("Image uploaded successfully!");
      console.log("detected_students", data.detected_students);
      setAttendenceId(data.attendance_id);
      setDetectedStudents(data.detected_students);

      // Fetch students after detecting attendance
      fetchStudents();
    } catch (error) {
      console.error("Upload Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/lecturer-api/get-students`);
      const data = await response.json();

      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Fetch Students Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (students.length > 0 && detectedStudents.length > 0) {
      const initialAttendance = {};
      students.forEach((student) => {
        initialAttendance[student.Student_ID] = detectedStudents.includes(student.Student_ID);
      });
      setAttendance(initialAttendance);
      console.log("Updated Attendance:", initialAttendance);
    }
  }, [detectedStudents, students]);  // Runs when either `detectedStudents` or `students` updates

  const toggleAttendance = (studentID) => {
    setAttendance((prev) => ({
      ...prev,
      [studentID]: !prev[studentID],
    }));
  };



  const submitAttendance = async () => {
    setLoading(true);
    const presentStudents = Object.entries(attendance)
      .filter(([id, isPresent]) => isPresent)  // Filter students marked as true
      .map(([id]) => id);
    const finalAttendance = {
      attendance_id: attendanceId,
      students_present: presentStudents,
    };
    console.log("Final Attendance Data:", finalAttendance);

    try {
      const response = await fetch(
        `${API_BASE_URL}/lecturer-api/submit-attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalAttendance),
        }
      );

      const data = await response.json();
      console.log("Attendance Submitted:", data);
      if (data.success) {
        alert("Attendance submitted successfully!");
      }
    } catch (error) {
      console.error("Submit Error:", error);
    } finally {
      setLoading(false);
    }
  };

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
    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
     
      <Text style={styles.welcomeText}>Welcome {lecturer.Name}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={selectImage}>
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take a Photo</Text>
        </TouchableOpacity>
      </View>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      {loading && <ActivityIndicator size="large" color="#6C4EF2" />}

      {students.length > 0 && (
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeader}>Student ID</Text>
            <Text style={styles.tableHeader}>Select</Text>
          </View>
          <ScrollView>
            {students.map((student, index) => (
              <View
                key={student.Student_ID}
                style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
              >
                <Text style={styles.tableText}>{student.Student_ID}</Text>
                <CustomCheckbox
                  isChecked={attendance[student.Student_ID]}
                  onPress={() => toggleAttendance(student.Student_ID)}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.submitButton} onPress={submitAttendance}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

export default LecturerDashboard;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#6C4EF2",
    padding: 10,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginVertical: 10,
  },
  tableContainer: {
    width: "10%",
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 3,
    padding: 10,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#555",
    padding: 10,
    borderRadius: 5,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    width: "30%",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableText: {
    width: "30%",
    textAlign: "center",
    fontSize: 14,
  },
  table: {
    width: "100%",
    marginVertical: 20,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: "#fff",
  },
  tableHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  tableHeader: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  rowEven: {
    backgroundColor: "#f9f9f9",
  },
  rowOdd: {
    backgroundColor: "#fff",
  },
  tableText: {
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#6C4EF2",
    padding: 10,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20 // Centers horizontally
  },
  welcomeText: {
    fontWeight: "bold",
    color: "#2D0C57",
    fontSize: 20,
    marginTop:20,
    marginBottom: 20, // Adds spacing below the text
    // Ensures it's centered
  },
  logoutButton:{
    position: "absolute",  // Positions it on top
    right: 15,             // Aligns to the right
    top: 10,               // Adjusts vertical position
    marginBottom: 20, // Adds spacing below the button
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  logoutText: {
    fontSize: 14,
    color:'red',
    fontWeight: "bold",
  },
});

