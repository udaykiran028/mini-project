import sys
import json
import face_recognition
import pickle
import numpy as np

# Load trained model
with open("face_recognizer.pkl", "rb") as f:
    classifier = pickle.load(f)

students = list(classifier.classes_)
CONFIDENCE_THRESHOLD = 0.8

def recognize_faces(image_path):
    img = face_recognition.load_image_file(image_path)
    face_locations = face_recognition.face_locations(img)
    face_encodings = face_recognition.face_encodings(img, face_locations)

    recognized_faces = []

    if not face_encodings:
        return [{"name": "No face detected"}]

    for encoding in face_encodings:
        probabilities = classifier.predict_proba([encoding])[0]
        best_match_index = np.argmax(probabilities)
        confidence = probabilities[best_match_index]

        name = students[best_match_index] if confidence >= CONFIDENCE_THRESHOLD else "Unknown"
        recognized_faces.append({"name": name, "confidence": float(confidence)})

    return recognized_faces

# Get image path from command line
if __name__ == "__main__":
    image_path = sys.argv[1]
    result = recognize_faces(image_path)
    print(json.dumps(result))  # Send result as JSON
