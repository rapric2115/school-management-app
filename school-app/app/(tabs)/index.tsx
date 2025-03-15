import React, { useState, useEffect, useContext } from 'react';
import { Image, StyleSheet, Platform, 
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import {
  LineChart,
  PieChart
} from "react-native-chart-kit";
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useStore } from '../../context/DataContext';

export default function HomeScreen() {
  const { currentStudent, students, user, fetchStudents, setCurrentStudent, logout, isLoading, fetchSubjectGrades  } = useStore();
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStudents();
  },[currentStudent, students])

  const handleStudentChange = (student: any) => {
    setCurrentStudent(student);
    fetchSubjectGrades(student);
    // console.log('from handleStudent', student);
    setShowStudentPicker(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const gradeData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{data: [65, 59, 80, 81, 56, 55]}],
}

const onRefresh = () => {
  setRefreshing(true);
  fetchStudents();
  console.log('data on refresh', currentStudent);
  setRefreshing(false);
}

const formatTimestamp = (timestamp: any) => {
  if (timestamp && timestamp.toDate) {
    // Convert Firestore timestamp to a Date object
    const date = timestamp.toDate();
    // Format the date as "Month Day, Year" (e.g., "March 22, 2025")
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return 'No date'; // Fallback if timestamp is missing or invalid
};

if (isLoading || !currentStudent) {
  return (
    <ThemedView style={styles.loadingContainer}>
      <ThemedText style={styles.loadingText}>Loading...</ThemedText>
    </ThemedView>
  );
}

  return (
    <ScrollView style={styles.container}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
    >
      <ThemedView style={{ flex: 1 }}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <ThemedText style={{justifyContent: 'center'}}>Logout</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.header} 
          onPress={() => setShowStudentPicker(!showStudentPicker)}
        >
          {currentStudent && (
            <Image
              source={{ uri: currentStudent.avatar }}
              style={styles.avatar}
            />
          )}
          <ThemedView style={styles.headerText} darkColor='dark'>
            <ThemedText darkColor='dark'>{currentStudent?.name ?? 'No Name'}</ThemedText>
            <ThemedText darkColor='dark'>{currentStudent?.grade ?? 'No Grade'}</ThemedText>
          </ThemedView>
          <Ionicons name="chevron-down" size={24} color="#64748b" />         
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#64748b" />
          <ThemedText style={{justifyContent: 'center'}}>Logout</ThemedText>
        </TouchableOpacity> */}
      </ThemedView>
      {showStudentPicker && (
        <ThemedView style={styles.studentPicker}>
          {Object.entries(students).map(([id, student]) => (
            <TouchableOpacity
              key={id}
              style={styles.studentOption}
              onPress={() => handleStudentChange(student)}>
              <Image source={{ uri: student.avatar }} style={styles.smallAvatar} />
              <ThemedText style={styles.studentOptionText}>{student.name}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      )}
      <ThemedView style={[styles.card, ]}>
        <ThemedText darkColor='light' style={{alignSelf: 'center', marginBottom: 10}}>Bank Accounts Information</ThemedText>
        <ThemedView style={{flexDirection: 'row', 
          justifyContent: 'space-around'}} darkColor='dark'>
          <ThemedText darkColor='light'>Popular Bank</ThemedText>
          <ThemedText darkColor='light'>032 156789 6</ThemedText>
        </ThemedView>
        <ThemedView style={{flexDirection: 'row', justifyContent: 'space-around'}} darkColor='dark'>
          <ThemedText darkColor='light'>BHD Bank</ThemedText>
          <ThemedText darkColor='light'>032 156789 6</ThemedText>
        </ThemedView>
        <ThemedView style={{flexDirection: 'row', justifyContent: 'space-around'}} darkColor='dark'>
          <ThemedText darkColor='light'>Scotiabank</ThemedText>
          <ThemedText darkColor='light'>032 156789 6</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardTitle}>Quick Stats</ThemedText>
        <ThemedView style={styles.statsContainer} darkColor='dark'>
          <ThemedView style={styles.stat} darkColor='dark'>
            <ThemedText style={styles.statLabel}>Attendance</ThemedText>
            <ThemedText style={styles.statValue}>{currentStudent? currentStudent.attendancePorcentage: 'no attendance'}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.stat} darkColor='dark'>
            <ThemedText style={styles.statLabel}>Next Payment</ThemedText>
            <ThemedText style={styles.statValue}>{currentStudent ? formatTimestamp(currentStudent.nextPayment) : 'No next payment'}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.stat} darkColor='dark'>
            <ThemedText style={styles.statLabel}>Amount Due</ThemedText>
            <ThemedText style={styles.statValue}>${currentStudent? currentStudent.tuition: 'no amount'}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardTitle}>Grades</ThemedText>
        <LineChart
          data={gradeData}
          width={Platform.OS === 'web' ? 400 : 300}
          height={200}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  studentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  headerText: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  grade: {
    fontSize: 16,
    color: '#64748b',
  },
  logoutButton: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#40798C'
  },
  studentPicker: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  studentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  studentOptionText: {
    fontSize: 16,
    color: '#1e293b',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563eb',
  },
  statDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
  },
 
});
