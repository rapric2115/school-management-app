import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../../context/DataContext';
import { Student } from '@/types/student';

export default function TabTwoScreen() {
  const { currentStudent, schoolInfo, fetchSchoolInformation } = useStore();
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements ] = useState<any[]>([]);
  const [events, setEvents ] = useState<any[]>([])
  
  useEffect(() => {
    fetchSchoolInformation();
  }, [schoolInfo]);

  // const loadStudent = async () => {
  //   const studentId = await AsyncStorage.getItem('studentId');
  //   if (studentId && students[studentId]) {
  //     setCurrentStudent(students[studentId]);
  //   }
  // };

  console.log('data from info: ', announcements)

  useEffect(() => {
    if(schoolInfo.length > 0) {
      const extractedAnnouncement: any[] = [];
      const extractedEvents: any[] = [];
      schoolInfo.forEach((item) => {
        Object.entries(item).forEach(([key, value]) => {
          if(key !== 'id' && typeof value === 'object') {
            extractedAnnouncement.push({
              id: key,
              title: value.title,
              date: value.date.toDate().toLocaleDateString(),
              content: value.content,
              priority:value.priority || 'medium',
              image: value.image || '',
            })
          } else if (item.id === 'events') {
            Object.entries(item).forEach(([key, value]) => {
              if(key !== 'id' && typeof value === 'object') {
                extractedEvents.push({
                  id: key,
                  title: value.title,
                  date: value.date.toDate().toLocaleDateString(),
                  time: value.time || '',
                  location: value.location || 'NA'
                })
              }
            })
          }
        })
      })

      setAnnouncements(extractedAnnouncement);
      setEvents(extractedEvents)
     }
  }, [])

  // console.log('Data from school info', schoolInfo);

  // const announcements = [
  //   {
  //     id: 1,
  //     title: 'Spring Break Schedule',
  //     date: 'March 20, 2024',
  //     content: 'Spring break will be from April 1-5. Classes resume on April 8.',
  //     priority: 'high',
  //     image: 'https://images.unsplash.com/photo-1596386461350-326ccb383e9f?w=800&q=80',
  //   },
  //   {
  //     id: 2,
  //     title: 'Parent-Teacher Conference',
  //     date: 'March 18, 2024',
  //     content: 'Schedule your meeting with teachers for the upcoming parent-teacher conference day.',
  //     priority: 'medium',
  //   },
  //   {
  //     id: 3,
  //     title: 'Science Fair Registration',
  //     date: 'March 15, 2024',
  //     content: 'Registration for the annual science fair is now open. Submit your project proposals by March 25.',
  //     priority: 'medium',
  //     image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
  //   },
  // ];

  // const events = [
  //   {
  //     id: 1,
  //     title: 'Sports Day',
  //     date: 'March 30, 2024',
  //     time: '9:00 AM - 4:00 PM',
  //     location: 'School Sports Complex',
  //     image: 'https://images.unsplash.com/photo-1576858574144-9ae1ebcf5ae5?w=800&q=80',
  //   },
  //   {
  //     id: 2,
  //     title: 'Art Exhibition',
  //     date: 'April 15, 2024',
  //     time: '2:00 PM - 6:00 PM',
  //     location: 'School Auditorium',
  //     image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
  //   },
  //   {
  //     id: 3,
  //     title: 'Career Day',
  //     date: 'April 20, 2024',
  //     time: '10:00 AM - 3:00 PM',
  //     location: 'Main Hall',
  //     image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  //   },
  // ];

  const renderPriorityBadge = (priority: any) => {
    const colors = {
      high: { bg: '#fee2e2', text: '#dc2626' },
      medium: { bg: '#fef9c3', text: '#ca8a04' },
      low: { bg: '#dcfce7', text: '#16a34a' },
    };

    return (
      <View style={[styles.priorityBadge, { backgroundColor: colors[priority].bg }]}>
        <Text style={[styles.priorityText, { color: colors[priority].text }]}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>School Information</Text>
        {/* <Text style={styles.headerSubtitle}>{currentStudent.grade}</Text> */}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'announcements' && styles.activeTab]}
          onPress={() => setActiveTab('announcements')}>
          <Ionicons
            name="megaphone"
            size={20}
            color={activeTab === 'announcements' ? '#2563eb' : '#64748b'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'announcements' && styles.activeTabText
          ]}>
            Announcements
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}>
          <Ionicons
            name="calendar"
            size={20}
            color={activeTab === 'events' ? '#2563eb' : '#64748b'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'events' && styles.activeTabText
          ]}>
            Events
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'announcements' ? (
          <>
            {announcements.map((announcement) => (
              <View key={announcement.id} style={styles.card}>
                {announcement.image && (
                  <Image
                    source={{ uri: announcement.image }}
                    style={styles.cardImage}
                  />
                )}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{announcement.title}</Text>
                    {announcement.priority && renderPriorityBadge(announcement.priority)}
                  </View>
                  <Text style={styles.cardDate}>{announcement.date}</Text>
                  <Text style={styles.cardText}>{announcement.content}</Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            {events.map((event) => (
              <View key={event.id} style={styles.card}>
                <Image
                  source={{ uri: event.image }}
                  style={styles.cardImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{event.title}</Text>
                  <Text style={styles.cardDate}>{event.date}</Text>
                  <Text style={styles.cardTime}>
                    <Ionicons name="time-outline" size={16} color="#64748b" /> {event.time}
                  </Text>
                  <Text style={styles.cardLocation}>
                    <Ionicons name="location-outline" size={16} color="#64748b" /> {event.location}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#64748b',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  cardDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  cardTime: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
});