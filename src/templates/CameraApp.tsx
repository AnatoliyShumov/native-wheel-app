import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { Camera } from 'expo-camera';

export default function App() {
    const [startCamera, setStartCamera] = useState([false, false]); // Оновлено для підтримки двох камер
    const [previewVisible, setPreviewVisible] = useState([false, false]);
    const [capturedImage, setCapturedImage] = useState([null, null]);
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
    const [flashMode, setFlashMode] = useState('off');

    const cameraRefs = useRef([null, null]);



    const __startCamera = async (index) => {
        const { status } = await Camera.requestPermissionsAsync();
        if (status === 'granted') {
            const updatedStartCamera = [...startCamera];
            updatedStartCamera[index] = true;
            setStartCamera(updatedStartCamera);
        } else {
            Alert.alert('Access denied');
        }
    };

    const __takePicture = async (index) => {
        if (cameraRefs.current[index]) {
            const photo = await cameraRefs.current[index].takePictureAsync();
            const updatedPreviewVisible = [...previewVisible];
            const updatedCapturedImage = [...capturedImage];
            updatedPreviewVisible[index] = true;
            updatedCapturedImage[index] = photo;
            setPreviewVisible(updatedPreviewVisible);
            setCapturedImage(updatedCapturedImage);
        }
    };

    const __retakePicture = (index) => {
        const updatedCapturedImage = [...capturedImage];
        const updatedPreviewVisible = [...previewVisible];
        updatedCapturedImage[index] = null;
        updatedPreviewVisible[index] = false;
        setCapturedImage(updatedCapturedImage);
        setPreviewVisible(updatedPreviewVisible);
        __startCamera(index);
    };

    const __savePhoto = () => {}
    const __handleFlashMode = () => {
        if (flashMode === 'on') {
            setFlashMode('off')
        } else if (flashMode === 'off') {
            setFlashMode('on')
        } else {
            setFlashMode('auto')
        }
    }
    const __switchCamera = () => {
        if (cameraType === 'back') {
            setCameraType('front')
        } else {
            setCameraType('back')
        }
    }

    return (
        <ScrollView style={styles.container} horizontal pagingEnabled>
            {[0, 1].map((index) => (
                <View key={index} style={styles.cameraContainer}>
                    {startCamera[index] ? (
                        previewVisible[index] && capturedImage[index] ? (
                            <ImageBackground source={{ uri: capturedImage[index].uri }} style={styles.preview}>
                                {/* Кнопки перезйомки та збереження фото */}
                            </ImageBackground>
                        ) : (
                            <Camera
                                type={cameraType}
                                flashMode={flashMode}
                                style={styles.camera}
                                ref={(ref) => (cameraRefs.current[index] = ref)}
                            >
                                {/* Кнопки управління камерою */}
                                <TouchableOpacity onPress={() => __takePicture(index)} style={styles.captureButton} />
                            </Camera>
                        )
                    ) : (
                        <TouchableOpacity onPress={() => __startCamera(index)} style={styles.startCameraButton}>
                            <Text style={styles.buttonText}>Take picture</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}
            <StatusBar style="auto" />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    cameraContainer: {
        flex: 1,
        width: '100%', // Забезпечте, щоб ширина відповідала ширині екрану
    },
    camera: {
        flex: 1,
    },
    preview: {
        flex: 1,
    },
    captureButton: {
        // Стилі для кнопки зйомки
    },
    startCameraButton: {
        // Стилі для кнопки запуску камери
    },
    buttonText: {
        // Стилі для тексту всередині кнопок
    },
})

const CameraPreview = ({photo, retakePicture, savePhoto}: any) => {
    console.log('sdsfds', photo)
    return (
        <View
            style={{
                backgroundColor: 'transparent',
                flex: 1,
                width: '100%',
                height: '100%'
            }}
        >
            <ImageBackground
                source={{uri: photo && photo.uri}}
                style={{
                    flex: 1
                }}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        padding: 15,
                        justifyContent: 'flex-end'
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}
                    >
                        <TouchableOpacity
                            onPress={retakePicture}
                            style={{
                                width: 130,
                                height: 40,

                                alignItems: 'center',
                                borderRadius: 4
                            }}
                        >
                            <Text
                                style={{
                                    color: '#fff',
                                    fontSize: 20
                                }}
                            >
                                Re-take
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={savePhoto}
                            style={{
                                width: 130,
                                height: 40,

                                alignItems: 'center',
                                borderRadius: 4
                            }}
                        >
                            <Text
                                style={{
                                    color: '#fff',
                                    fontSize: 20
                                }}
                            >
                                save photo
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </View>
    )
}