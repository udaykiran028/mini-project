import React, { createContext, useState, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [student, setStudent] = useState(null);  // State for student user
    const [lecturer, setLecturer] = useState(null);  // State for lecturer user
    const [userType, setUserType] = useState(null);

    const loginUser = (userType, userData) => {
        setUserType(userType);
        if (userType === "student") {
            setStudent(userData);
            setLecturer(null);  // Ensure only one user type is active
        } else if (userType === "lecturer") {
            setLecturer(userData);
            setStudent(null);
        }
    };

    const logoutUser = () => {
        setUserType(null);
        setStudent(null);
        setLecturer(null);
    };

    return (
        <UserContext.Provider value={{ student, lecturer, loginUser, logoutUser, userType }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use context
export const useUser = () => {
    return useContext(UserContext);
};
