import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../../context/DataContext';


export default function Grades() {
     const { currentStudent, students, isLoading, subjectGrade, fetchSubjectGrades  } = useStore();
    // const [currentStudent, setCurrentStudent] = useState(students[1]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (currentStudent?.id) {
          fetchSubjectGrades(currentStudent.id);
        }
      }, [currentStudent]); // Add currentStudent as a dependency

      const onRefresh = () => {
        setRefreshing(true);
        if (currentStudent?.id) {
          fetchSubjectGrades(currentStudent.id).finally(() => setRefreshing(false));
        } else {
          setRefreshing(false);
        }
      };

    // const loadStudent = async () => {
    //     const studentId = await AsyncStorage.getItem('studentId');
    //     if(studentId && students[studentId]) {
    //         setCurrentStudent(students[studentId]);
    //     }
    // }

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
            {currentStudent && (
                <ThemedView style={styles.summary}>
                    <ThemedText style={styles.studentName}>{currentStudent.name}</ThemedText>
                    <ThemedText style={styles.gpa}>{currentStudent.gpa}</ThemedText>
                    <ThemedText style={styles.term}>{currentStudent.term}</ThemedText>
                </ThemedView>
            )}
           {subjectGrade.length > 0 ? (
                subjectGrade.map((grade) => (
                <ThemedView key={grade.id} style={styles.subjectCard}>
                    <ThemedView style={styles.subjectHeader} darkColor='dark'>
                    <Text style={styles.subjectName}>
                        {grade.subjectName}
                    </Text>
                    <ThemedView style={styles.gradeContainer} darkColor='dark'>
                        <ThemedText style={styles.grade}>{grade.grade}</ThemedText>
                    </ThemedView>
                    </ThemedView>
                    <ThemedView style={styles.progressBar}>
                    <ThemedView style={[styles.progress, { width: `${grade.grade}%` }]}></ThemedView>
                    </ThemedView>
                </ThemedView>
                ))
            ) : (
                <ThemedText style={styles.noSubjectsText}>No grades found.</ThemedText>
            )}
                    </ScrollView>
                )
            }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9'
    },
    summary: {
        backgroundColor: '#40798C',
        padding: 20,
        alignItems: 'center'
    },
    studentName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 10
    },
    gpa: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 5,
        paddingTop: 10
    },
    subjectCard: {
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3
    },
    subjectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    subjectName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000'
    },
    gradeContainer: {
        alignItems: 'flex-end'
    },
    grade: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2563eb'
    },
    percentage: {
        fontSize: 14,
        color: '#64748b'
    },
    progressBar: {
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        overflow: 'hidden'
    },
    progress: {
        height: '100%',
        backgroundColor: '#2563eb'
    },
    term: {
        fontSize: 14,
        fontWeight: '700'
    },
    noSubjectsText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginTop: 20,
        alignSelf: 'center'
    }
})