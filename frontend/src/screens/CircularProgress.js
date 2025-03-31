import React from "react";
import { View, Text } from "react-native";
import { Svg, Circle } from "react-native-svg";

const CircularProgress = ({ percentage }) => {
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width="120" height="120">
        {/* Background Circle */}
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke="lightgray"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke="purple"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ position: "absolute", fontSize: 20, fontWeight: "bold" }}>
        {percentage}%
      </Text>
    </View>
  );
};

export default CircularProgress;
