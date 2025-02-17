import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Payments() {
  const payments = [
    {
      id: 1,
      type: 'Tuition Fee',
      amount: 500,
      dueDate: 'March 15, 2024',
      status: 'pending',
    },
    {
      id: 2,
      type: 'Lab Fee',
      amount: 100,
      dueDate: 'March 20, 2024',
      status: 'pending',
    },
    {
      id: 3,
      type: 'Library Fee',
      amount: 50,
      dueDate: 'April 1, 2024',
      status: 'paid',
    },
  ];

  const history = [
    {
      id: 1,
      type: 'Tuition Fee',
      amount: 500,
      date: 'February 15, 2024',
      status: 'paid',
    },
    {
      id: 2,
      type: 'Books',
      amount: 150,
      date: 'February 1, 2024',
      status: 'paid',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Outstanding</Text>
        <Text style={styles.balanceAmount}>$650.00</Text>
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Payments</Text>
        {payments.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentType}>{payment.type}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: payment.status === 'paid' ? '#dcfce7' : '#fef9c3' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: payment.status === 'paid' ? '#16a34a' : '#ca8a04' }
                ]}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.paymentDetails}>
              <View>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amount}>${payment.amount}.00</Text>
              </View>
              <View>
                <Text style={styles.dueDateLabel}>Due Date</Text>
                <Text style={styles.dueDate}>{payment.dueDate}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        {history.map((payment) => (
          <View key={payment.id} style={styles.historyCard}>
            <View style={styles.historyLeft}>
              <Text style={styles.historyType}>{payment.type}</Text>
              <Text style={styles.historyDate}>{payment.date}</Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyAmount}>-${payment.amount}.00</Text>
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  balanceCard: {
    backgroundColor: '#40798C',
    padding: 20,
    margin: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#e2e8f0',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  payButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
    marginLeft: 5,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  dueDateLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 16,
    color: '#1e293b',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeft: {
    flex: 1,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#64748b',
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 8,
  },
});