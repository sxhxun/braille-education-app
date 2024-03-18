import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const steps = [
  '튜토리얼', '자음', '모음', '받침', '약자', '숫자', '약어', '문장부호', '영어(알파벳)'
];

const WritingScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.headerButton}>{'\u003C'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>T&T</Text>
        <View style={styles.menuPlaceholder} />
      </View>
      <ScrollView style={styles.content}>
        {steps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => {/* 여기에 각 단계별로 이동하는 로직을 구현하세요 */}}>
            <Text style={styles.buttonText}>{step}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingHorizontal: 15,
    paddingVertical: 15,
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
    width: 48, // Back 버튼과 메뉴 버튼의 공간을 동일하게 만들기 위함
  },
  content: {
    flex: 1,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    //marginBottom: 10,
    marginTop:15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default WritingScreen;
