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
import CustomCheckbox from "../CustomCheckbox";
import { getAuth, signOut } from "firebase/auth";

export const API_BASE_URL = '10.100.5.229'
const LecturerDashboard = ({ navigation }) => {
  
  const { lecturer, logoutUser } = useUser();
  const [imageUri, setImageUri] = useState(null);
  const [detectedStudents, setDetectedStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState({});
  const [attendanceId, setAttendenceId] = useState(null);

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
    if (!lecturer) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", { uri, type: "image/jpeg", name: "photo.jpg" });
    formData.append("lecture_id", lecturer.Lecturer_ID);
    formData.append("subject", lecturer.Courses_Code[0]);

    try {
      const response = await fetch(
        `http://${API_BASE_URL}:5000/lecturer-api/upload-attendance`,
        {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const data = await response.json();
      if (!data.success) {
        alert("Error uploading image. Please try again.");
        return;
      }

      alert("Image uploaded successfully!");
      setAttendenceId(data.attendance_id);
      setDetectedStudents(data.detected_students);
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
      const response = await fetch(`http://${API_BASE_URL}:5000/lecturer-api/get-students`);
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
    }
  }, [detectedStudents, students]);

  const toggleAttendance = (studentID) => {
    setAttendance((prev) => ({
      ...prev,
      [studentID]: !prev[studentID],
    }));
  };

  const submitAttendance = async () => {
    setLoading(true);
    const presentStudents = Object.entries(attendance)
      .filter(([_, isPresent]) => isPresent)
      .map(([id]) => id);

    const finalAttendance = {
      attendance_id: attendanceId,
      students_present: presentStudents,
    };

    try {
      const response = await fetch(
        `http://${API_BASE_URL}:5000/lecturer-api/submit-attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalAttendance),
        }
      );

      const data = await response.json();
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
      await signOut(auth);
      logoutUser();
      navigation.replace("LoginScreen");
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  // Show loader if lecturer data is still undefined
  if (!lecturer) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6C4EF2" />
        <Text>Loading Lecturer Info...</Text>
      </View>
    );
  }

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
          {students.map((student, index) => (
            <View
              key={student.Student_ID}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.rowEven : styles.rowOdd,
              ]}
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
    marginBottom: 20,
  },
  welcomeText: {
    fontWeight: "bold",
    color: "#2D0C57",
    fontSize: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    position: "absolute",
    right: 15,
    top: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  logoutText: {
    fontSize: 14,
    color: "red",
    fontWeight: "bold",
  },
});
