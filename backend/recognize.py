# recognize_face.py
import sys
import json
import face_recognition
import pickle
import numpy as np

with open("face_recognizer.pkl", "rb") as f:
    classifier = pickle.load(f)

with open("pca_model.pkl", "rb") as f:
    pca = pickle.load(f)

students = list(classifier.classes_)
CONFIDENCE_THRESHOLD = 0.6

def recognize_faces(image_path):
    img = face_recognition.load_image_file(image_path)
    face_locations = face_recognition.face_locations(img)
    face_encodings = face_recognition.face_encodings(img, face_locations)

    if not face_encodings:
        return [{"name": "No face detected"}]

    recognized = []
    for enc in face_encodings:
        enc_pca = pca.transform([enc])
        probs = classifier.predict_proba(enc_pca)[0]
        max_idx = np.argmax(probs)
        confidence = probs[max_idx]
        name = students[max_idx] if confidence >= CONFIDENCE_THRESHOLD else "Unknown"
        recognized.append({"name": name, "confidence": float(confidence)})

    return recognized

if __name__ == "__main__":
    image_path = sys.argv[1]
    result = recognize_faces(image_path)
    print(json.dumps(result))
