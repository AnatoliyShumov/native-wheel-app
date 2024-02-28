import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Slider from '@react-native-community/slider';
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
            onPictureTaken(photo.uri, index);
        }
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
    const [images, setImages] = useState([{ uri: null, blur: 0, sharpness: 0 }, { uri: null, blur: 0, sharpness: 0 }]);

    console.log("images", images)

    const handlePictureTaken = (uri, index) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], uri: uri };
        setImages(newImages);
    };

    const retakePhoto = (index) => {
        const newImages = [...images];
        newImages[index] = null;
        setImages(newImages);
    };

    const applyImageManipulations = async (index) => {
        if (images[index].uri) {
            const { uri, blur } = images[index];
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                uri,
                [{ blur: blur }],
                { compress: 1, format: ImageManipulator.SaveFormat.PNG }
            );
            const updatedImages = [...images];
            updatedImages[index] = { ...updatedImages[index], uri: manipulatedImage.uri };
            setImages(updatedImages);
        }

    };


    return (
        <ScrollView style={styles.container}>
            {images.map((image, index) => (
                <View key={index} style={styles.cameraContainer}>
                    {image?.uri ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: image.uri }} style={styles.image} blurRadius={image.blur} />
                            <Slider
                                style={{ width: 200, height: 40, marginBottom: 50 }}
                                minimumValue={0}
                                maximumValue={20}
                                value={image.blur}
                                onValueChange={(value) => {
                                    const updatedImages = images.map((img, imgIndex) => {
                                        if (index === imgIndex) {
                                            return { ...img, blur: value };
                                        }
                                        return img;
                                    });
                                    setImages(updatedImages);
                                }}
                                onSlidingComplete={() => applyImageManipulations(index)}
                            />
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
        bottom: 40,
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
        paddingBottom: 50
    },
    cameraContainer: {
        marginVertical: 20,
        paddingBottom: 40,
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
