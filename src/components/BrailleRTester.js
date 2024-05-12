import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, PanResponder, Dimensions, StyleSheet, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTTS } from './TTSContext';
import getRandomBrailleIndex from './RandomBrailleGenerator';

// 화면 영역 분할
const window = Dimensions.get('window');
const width = window.width;
const top = window.height / 3;
const bottom = window.height * 2 / 3;

// 점자 영역 설정
const points = [
    {
      x: 0,
      y: top,
      width: width / 2,
      height: bottom / 3,
    },
    {
      x: 0,
      y: top + bottom / 3,
      width: width / 2,
      height: bottom / 3,
    },
    {
      x: 0,
      y: top + bottom * 2 / 3,
      width: width / 2,
      height: bottom / 3,
    },
    {
      x: width / 2,
      y: top,
      width: width / 2,
      height: bottom / 3,
    },
    {
      x: width / 2,
      y: top + bottom / 3,
      width: width / 2,
      height: bottom / 3,
    },
    {
      x: width / 2,
      y: top + bottom * 2 / 3,
      width: width / 2,
      height: bottom / 3,
    },
  ];

const getTouchedAreaIndex = (touchX, touchY) => {
    const index = points.findIndex((point) =>
        touchX >= point.x && touchX <= point.x + point.width
        && touchY >= point.y && touchY <= point.y + point.height
    );
    return index;
};

// 랜덤 점자 인덱스
let randomIndex = [];

const getComponentBraille = (braille) => {
    let result = "";

    braille.forEach((dot, index) => {
        if (index != 0 && index % 6 === 0) {
            result += "점 ";
        }
        if (dot === 1) {
            result += `${(index % 6) + 1} `;
        }
    });
    result += "점";

    return result;
};

const BrailleRTester = ({ category, brailleSymbols, brailleList }) => {
    const { speech } = useTTS();
    const [currentBraille, setCurrentBraille] = useState(0);
    const [touchIndex, setTouchIndex] = useState(-1);
    const [previousTouchTime, setPreviousTouchTime] = useState(null);
    const currentBrailleRef = useRef(currentBraille);
    const touchIndexRef = useRef(touchIndex);
    const previousTouchTimeRef = useRef(null);
    const navigation = useNavigation();

    // 랜덤 점자 인덱스 초기화
    useEffect(() => {
        randomIndex = getRandomBrailleIndex(brailleList);
    }, []);

    useEffect(() => {
        const message = `점자 읽기 시험입니다.`;
        speech(message);
    }, []);

    useEffect(() => {
        currentBrailleRef.current = currentBraille;
        touchIndexRef.current = touchIndex;
        previousTouchTimeRef.current = previousTouchTime;
    }, [currentBraille, touchIndex, previousTouchTime]);

    const tts_information = () => {
        const message = `다음 ${category} 를 읽고 정답확인을 눌러 정답을 확인하세요!`;
        speech(message);
    };

    useEffect(() => {
        tts_information();
    }, [currentBraille]);

    function tts_dot(index) {
        if (index === -1) return;
        const message = `${index+1}점`;
        let pitch = 1;
        if (brailleList[randomIndex[currentBrailleRef.current]][index] === 1) {
            pitch = 1.5;
        }
        speech(message, null, pitch);
    };

    useEffect(() => {
        tts_dot(touchIndex);
    }, [touchIndex]);

    // PanResponder 초기화
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const currentTouchTime = Date.now();
                const touch = evt.nativeEvent.touches;
                if (touch[0].pageY < top) {
                    const isDoubleTouched = (previousTouchTimeRef.current) && (currentTouchTime - previousTouchTimeRef.current) < 300;
                    if (isDoubleTouched) {
                        handleDoubleTouch(touch[0].pageX);
                    }
                    else {
                        handleTouch(touch[0].pageX);
                    }
                    previousTouchTimeRef.current = currentTouchTime;
                    setPreviousTouchTime(previousTouchTimeRef.current);
                }
            },
            onPanResponderMove: (evt) => {
                const touches = evt.nativeEvent.touches;
                
                touches.forEach((touch) => {
                    touchIndexRef.current = getTouchedAreaIndex(touch.pageX, touch.pageY);
                    setTouchIndex(touchIndexRef.current);

                    // 해당 영역의 brailleList 값이 1일 경우 햅틱 피드백
                    if (brailleList[randomIndex[currentBrailleRef.current]][touchIndexRef.current] === 1) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    }
                });
            },
        })
    ).current;
    
    // 화면 상단 터치 이벤트 처리
    const handleTouch = (touch) => {
        console.log('handleTouch!');
        const threshold = width / 3;

        // 화면 상단 좌측 : 이전 버튼 TTS
        if (touch <= threshold) {
            const message = `이전`;
            speech(message);
        }
        // 화면 상단 중앙 : 정답확인 TTS
        else if (touch > threshold && touch < 2 * threshold) {
            const message = `정답확인`;
            speech(message);
        }
        // 화면 상단 우측 : 다음 버튼 TTS
        else {
            const message = `다음`;
            speech(message);
        }
    };

    // 화면 상단 더블 터치 이벤트 처리
    const handleDoubleTouch = (touch) => {
        console.log('handleDoubleTouch!');
        const threshold = width / 3;

        // 화면 상단 좌측 : 이전 버튼
        if (touch <= threshold) {
            if (currentBrailleRef.current - 1 >= 0) currentBrailleRef.current -= 1;
            else currentBrailleRef.current = randomIndex.length - 1;
        }
        // 화면 상단 중앙 : 정답확인
        else if (touch > threshold && touch < 2 * threshold) {
            const component = getComponentBraille(brailleList[randomIndex[currentBrailleRef.current]]);
            const message = `정답은 ${category} ${brailleSymbols[randomIndex[currentBrailleRef.current]]} 입니다. 
                        ${brailleSymbols[randomIndex[currentBrailleRef.current]]} 은 ${component} 입니다.`;
            speech(message);
        }
        // 화면 상단 우측 : 다음 버튼
        else {
            currentBrailleRef.current = (currentBrailleRef.current + 1) % randomIndex.length;
        }
        setCurrentBraille(currentBrailleRef.current);
    };

    // 뒤로가기 버튼 이벤트 처리
    const handleBackButton = () => {
        const currentTouchTime = Date.now();
        const isDoubleTouched = (previousTouchTimeRef.current) && (currentTouchTime - previousTouchTimeRef.current) < 300;

        if (isDoubleTouched) {
            navigation.goBack();
        }
        else {
            const message = "뒤로가기";
            speech(message);
        }
        previousTouchTimeRef.current = currentTouchTime;
        setPreviousTouchTime(previousTouchTimeRef.current);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackButton}>
                    <Text style={styles.headerButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>점자랑</Text>
                <View style={styles.menuPlaceholder} />
            </View>
            <View {...panResponder.panHandlers} style={styles.content}>
                { /* Top 1/3 */}
                <View style={styles.top}>
                    <Text style={styles.text}>이전</Text>
                    <Text style={styles.text}>정답확인</Text>
                    <Text style={styles.text}>다음</Text>
                </View>

                { /* Bottom 2/3 */}
                <View  style={styles.bottom} >
                    {points.map((_, index) => (
                        <View key={index} style={styles.dotContainer}>
                            <View style={styles.dot} />
                        </View>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 15,
    },
    headerButton: {
        color: '#fff',
        fontSize: 18,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
    },
    menuPlaceholder: {
        width: 38,
    },
    content: {
        flex: 1,
    },
    top: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: '20%',
    },
    bottom: {
        flex: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    dotContainer: {
        width: '50%',
        height: '33.3%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 80,
        height: 80,
        borderRadius: 50,
        backgroundColor: 'black',
    },
});

export default BrailleRTester;