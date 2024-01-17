import React, {useRef, useState, useEffect} from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    Text as RNText,
    Dimensions,
    Animated
} from 'react-native';
import * as d3Shape from 'd3-shape';
import color from 'randomcolor';
import { snap } from '@popmotion/popcorn';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Path, G, Text, TSpan } from 'react-native-svg';
const { width } = Dimensions.get('screen');

const wheelSize = width * 0.95;
const fontSize = 26;
const oneTurn = 360;
const knobFill = color({ hue: 'purple' });

interface WheelPath {
    path: string;
    color: string;
    value: number;
    centroid: [number, number];
}
const makeWheel = (numberOfSegments: number): WheelPath[] => {
    const data = Array.from({ length: numberOfSegments }).fill(1);
    const arcs = d3Shape.pie()(data);
    const colors = color({
        luminosity: 'dark',
        count: numberOfSegments
    });

    return arcs.map((arc, index) => {
        const instance = d3Shape
            .arc()
            .padAngle(0.01)
            .outerRadius(width / 2)
            .innerRadius(20);

        return {
            path: instance(arc),
            color: colors[index],
            value: Math.round(Math.random() * 10 + 1) * 200, //[200, 2200]
            centroid: instance.centroid(arc)
        };
    });
};

const App = () => {
    const [enabled, setEnabled] = useState(true);
    const [finished, setFinished] = useState(false);
    const [winner, setWinner] = useState<WheelPath | null>(null);
    const [segments, setSegments] = useState(12);
    const [angleBySegment, setAngleBySegment] = useState(oneTurn / segments);
    const [angleOffset, setAngleOffset] = useState((oneTurn / segments) / 2);
    const [inputValue, setInputValue] = useState('12');
    const wheelPathsRef = useRef(makeWheel(segments));
    const _angle = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const angleListener = _angle.addListener(() => {
            if (enabled) {
                setEnabled(false);
                setFinished(false);
            }
        });

        return () => {
            _angle.removeListener(angleListener);
        };
    }, [enabled]);

    useEffect(() => {
        const newAngleBySegment = oneTurn / segments;
        const newAngleOffset = newAngleBySegment / 2;
        setAngleBySegment(newAngleBySegment);
        setAngleOffset(newAngleOffset);

        wheelPathsRef.current = makeWheel(segments);
    }, [segments]);


    const handleSegmentsChange = (text) => {
        setInputValue(text); // Оновлюємо тільки текстовий ввід

        const newSegments = parseInt(text, 10);
        if (!isNaN(newSegments) && newSegments > 0 && newSegments <= 20) {
            setSegments(newSegments); // Оновлюємо кількість сегментів тільки якщо ввід валідний
        }
    };
    const getWinnerIndex = () => {
        const angleBySegment = oneTurn / segments;
        const deg = Math.abs(Math.round(_angle._value % oneTurn));
        const index = _angle._value < 0
            ? Math.floor(deg / angleBySegment)
            : (segments - Math.floor(deg / angleBySegment)) % segments;
        return wheelPathsRef.current[index];
    };

    const onPan = ({ nativeEvent }) => {
        if (nativeEvent.state === State.END) {
            const { velocityY } = nativeEvent;

            Animated.decay(_angle, {
                velocity: velocityY / 1000,
                deceleration: 0.999,
                useNativeDriver: true
            }).start(() => {
                _angle.setValue(_angle._value % oneTurn);
                const snapTo = snap(oneTurn / segments);
                Animated.timing(_angle, {
                    toValue: snapTo(_angle._value),
                    duration: 300,
                    useNativeDriver: true
                }).start(() => {
                    const winnerSegment = getWinnerIndex();
                    setEnabled(true);
                    setFinished(true);
                    setWinner(winnerSegment);
                });
            });
        }
    };

    const renderKnob = () => {
        const knobSize = 30;
        // [0, numberOfSegments]
        const YOLO = Animated.modulo(
            Animated.divide(
                Animated.modulo(Animated.subtract(_angle, angleOffset), oneTurn),
                new Animated.Value(angleBySegment)
            ),
            1
        );

        return (
            <Animated.View
                style={{
                    width: knobSize,
                    height: knobSize * 2,
                    justifyContent: 'flex-end',
                    zIndex: 1,
                    transform: [
                        {
                            rotate: YOLO.interpolate({
                                inputRange: [-1, -0.5, -0.0001, 0.0001, 0.5, 1],
                                outputRange: ['0deg', '0deg', '35deg', '-35deg', '0deg', '0deg']
                            })
                        }
                    ]
                }}
            >
                <Svg
                    width={knobSize}
                    height={(knobSize * 100) / 57}
                    viewBox={`0 0 57 100`}
                    style={{ transform: [{ translateY: 8 }] }}
                >
                    <Path
                        d="M28.034,0C12.552,0,0,12.552,0,28.034S28.034,100,28.034,100s28.034-56.483,28.034-71.966S43.517,0,28.034,0z   M28.034,40.477c-6.871,0-12.442-5.572-12.442-12.442c0-6.872,5.571-12.442,12.442-12.442c6.872,0,12.442,5.57,12.442,12.442  C40.477,34.905,34.906,40.477,28.034,40.477z"
                        fill={knobFill}
                    />
                </Svg>
            </Animated.View>
        );
    };

    const renderWinner = () => {
        return (
            <RNText style={styles.winnerText}>Winner is: {winner?.value}</RNText>
        );
    };

    const _renderSvgWheel = () => {
        return (
            <View style={styles.container}>
                {renderKnob()}
                <Animated.View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: [
                            {
                                rotate: _angle.interpolate({
                                    inputRange: [-oneTurn, 0, oneTurn],
                                    outputRange: [`-${oneTurn}deg`, `0deg`, `${oneTurn}deg`]
                                })
                            }
                        ]
                    }}
                >
                    <Svg
                        width={wheelSize}
                        height={wheelSize}
                        viewBox={`0 0 ${width} ${width}`}
                        style={{ transform: [{ rotate: `-${angleOffset}deg` }] }}
                    >
                        <G y={width / 2} x={width / 2}>
                            {wheelPathsRef.current.map((arc, i) => {
                                const [x, y] = arc.centroid;
                                const number = arc.value.toString();

                                return (
                                    <G key={`arc-${i}`}>
                                        <Path d={arc.path} fill={arc.color} />
                                        <G
                                            rotation={(i * oneTurn) / segments + angleOffset}
                                            origin={`${x}, ${y}`}
                                        >
                                            <Text
                                                x={x}
                                                y={y - 70}
                                                fill="white"
                                                textAnchor="middle"
                                                fontSize={fontSize}
                                            >
                                                {Array.from({ length: number.length }).map((_, j) => {
                                                    return (
                                                        <TSpan
                                                            x={x}
                                                            dy={fontSize}
                                                            key={`arc-${i}-slice-${j}`}
                                                        >
                                                            {number.charAt(j)}
                                                        </TSpan>
                                                    );
                                                })}
                                            </Text>
                                        </G>
                                    </G>
                                );
                            })}
                        </G>
                    </Svg>
                </Animated.View>
            </View>
        );
    };

    return (
        <PanGestureHandler onHandlerStateChange={onPan} enabled={enabled}>
            <View style={styles.container}>
                <RNText>Max segments is 20</RNText>
                <TextInput
                    style={styles.input}
                    onChangeText={handleSegmentsChange}
                    value={inputValue}
                    keyboardType="numeric"
                    placeholder="Enter number of segments"
                    maxLength={2}
                />
                {_renderSvgWheel()}
                {finished && enabled && renderWinner()}
            </View>
        </PanGestureHandler>
    );
};

export default App

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    winnerText: {
        fontSize: 32,
        fontFamily: 'Menlo',
        position: 'absolute',
        bottom: 10
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        color: 'black',
        borderColor: 'gray',
        width: 100,
    },
});