import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import * as ImageManipulator from 'expo-image-manipulator';

const CameraBlock = ({ index, onPictureTaken }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const cameraRef = React.useRef(null);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const takePicture = async () => {
        if (cameraRef.current && cameraReady) {
            const photo = await cameraRef.current.takePictureAsync();
            const faces = await detectFaces(photo.uri);
            console.log('Detected faces:', faces); // Ви можете використовувати ці дані для подальших дій
            const manipulatedImage = await applyImageEffects(photo.uri);
            onPictureTaken(manipulatedImage.uri, index);
        }
    };

    const detectFaces = async (imageUri) => {
        const options = { mode: "fast" };
        return await FaceDetector.detectFacesAsync(imageUri, options);
    };

    const applyImageEffects = async (imageUri) => {
        // Приклад застосування блюру до зображення
        return await ImageManipulator.manipulateAsync(
            imageUri,
            [{ blur: 0.5 }], // Ви можете змінювати це значення для регулювання ефекту
            { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        );
    };

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <Camera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            ref={cameraRef}
            onCameraReady={() => setCameraReady(true)}
        >
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={takePicture} style={styles.button}>
                    <Text style={styles.text}>Take Picture</Text>
                </TouchableOpacity>
            </View>
        </Camera>
    );
};

const App = () => {
    const [images, setImages] = useState([null, null]);

    console.log("images", images)

    const handlePictureTaken = (uri, index) => {
        const newImages = [...images];
        newImages[index] = uri;
        setImages(newImages);
    };

    const retakePhoto = (index) => {
        const newImages = [...images];
        newImages[index] = null;
        setImages(newImages);
    };

    return (
        <ScrollView style={styles.container}>
            {[0, 1].map((index) => (
                <View key={index} style={styles.cameraContainer}>
                    {images[index] ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: images[index] }} style={styles.image} />
                            <TouchableOpacity onPress={() => retakePhoto(index)} style={styles.retakeButton}>
                                <Text style={styles.retakeButtonText}>Retake</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <CameraBlock index={index} onPictureTaken={handlePictureTaken} />
                    )}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    imagePreviewContainer: {
        width: 300,
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    retakeButton: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    retakeButtonText: {
        color: 'white',
        fontSize: 18,
    },
    container: {
        flex: 1,
    },
    cameraContainer: {
        marginVertical: 20,
        alignSelf: 'center',
        width: 300,
        height: 400,
    },
    camera: {
        flex: 1,
        width: 300,
        height: 400,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        margin: 20,
    },
    button: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'blue',
        padding: 10,
        marginBottom: 10,
    },
    text: {
        fontSize: 18,
        color: 'white',
    },
    image: {
        width: 300,
        height: 400,
    },
});

export default App;
