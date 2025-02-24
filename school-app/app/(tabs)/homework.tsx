import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useStore } from '../../context/DataContext';

export default function Homework() {
  const { currentStudent, homeworks, fetchHomework, fetchSubjectGrades } = useStore();
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredHomework, setFilteredHomework] = useState<any[]>([]);

  // Fetch homework and filter assignments when currentStudent or homeworks change
  useEffect(() => {
    if (currentStudent?.id) {
      fetchSubjectGrades(currentStudent.id);
      fetchHomework();
    }
  }, [currentStudent]);

  // Filter homework based on currentStudent.grade and filter status
  useEffect(() => {
    if (currentStudent && homeworks.length > 0) {
      // Step 1: Filter by grade
      const gradeFilteredAssignments = homeworks.filter((hw) => hw.id === currentStudent.grade);

      // Step 2: Flatten the nested structure and filter by status
      const flattenedAssignments = gradeFilteredAssignments.flatMap((hw) =>
        Object.entries(hw)
          .filter(([key, value]) => key !== 'id' && typeof value === 'object') // Ensure value is an object
          .map(([subject, details]) => ({
            subject,
            ...details,
          }))
      );

      setFilteredHomework(flattenedAssignments);
    }
  }, [currentStudent, homeworks, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    if (currentStudent?.id) {
      fetchSubjectGrades(currentStudent.id).finally(() => setRefreshing(false));
      fetchHomework().finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  };


  // Step 3: Filter by status (all, pending, completed)
  const statusFilteredAssignments = filteredHomework.filter((assignment) => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.studentName}>{currentStudent?.name}</Text>
        <Text style={styles.subtitle}>{currentStudent?.grade}</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={filter === 'all' ? styles.activeFilterText : styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
          onPress={() => setFilter('pending')}
        >
          <Text style={filter === 'pending' ? styles.activeFilterText : styles.filterText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={filter === 'completed' ? styles.activeFilterText : styles.filterText}>Completed</Text>
        </TouchableOpacity>
      </View>

      {statusFilteredAssignments.length > 0 ? (
        statusFilteredAssignments.map((assignment, index) => (
          <View key={index} style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <View style={styles.subjectTag}>
                <Text style={styles.subjectText}>{assignment.subject}</Text>
              </View>
              <Text style={styles.dueDate}>
                Due: {assignment.dueDate.toDate().toLocaleDateString()} {/* Convert Timestamp to readable date */}
              </Text>
            </View>

            <Text style={styles.title}>{assignment.title}</Text>

            <View style={styles.footer}>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: assignment.status === 'completed' ? '#22c55e' : '#eab308' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: assignment.status === 'completed' ? '#22c55e' : '#eab308' },
                  ]}
                >
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </Text>
              </View>

              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noAssignmentsText}>No assignments found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#40798C',
    padding: 20,
    alignItems: 'center',
  },
  studentName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    color: '#64748b',
  },
  activeFilterText: {
    color: '#fff',
  },
  assignmentCard: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
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
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectText: {
    color: '#4338ca',
    fontSize: 12,
    fontWeight: '500',
  },
  dueDate: {
    color: '#64748b',
    fontSize: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  noAssignmentsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#64748b',
  },
});