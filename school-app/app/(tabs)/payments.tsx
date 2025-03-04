import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useState, useEffect } from 'react';
import { useStore } from '../../context/DataContext';
import { createPaymentIntent, processPayment, recordFailedPayment } from '../../firebase/paymentService';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export default function Payments() {
  const { currentStudent, user } = useStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customPercentage, setCustomPercentage] = useState('');
  const [showCustomPayment, setShowCustomPayment] = useState(false);
  const [totalOutstanding, setTotalOutstanding] = useState(650);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [history, sethistory] = useState([]);

  const payments = [
    {
      id: 1,
      type: 'Tuition Fee',
      amount: 520,
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

  useEffect(() => {
    // Calculate total outstanding amount from pending payments
    const pendingTotal = payments
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    setTotalOutstanding(pendingTotal);

    console.log('from payment: ', currentStudent.payment)
    
    // Load payment history from Firebase
    if (currentStudent?.id) {
      fetchPaymentHistory();
    }
  }, [currentStudent]);

  const fetchPaymentHistory = async () => {
    try {
      if (!user?.uid || !currentStudent?.id) return;
      
      
      const paymentsRef = collection(db, 'payments');
      console.log('from payment fetching payments: ', paymentsRef._path.segments[0])
      const q = query(
        paymentsRef,
        where('studentId', '==', currentStudent.id),
        where('status', '==', 'completed')
      );
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          type: data.paymentType,
          amount: data.amount,
          date: data.completedAt ? new Date(data.completedAt.toDate()).toLocaleDateString() : 'Unknown',
          status: 'paid',
        });
      });
      
      // Sort client-side
      history.sort((a, b) => b.date - a.date); // Sort by date descending
      setPaymentHistory(history);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handlePayment = async (amount: number, paymentType: string) => {
    try {
      if (!user?.uid || !currentStudent?.id) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      
      setLoading(true);
      
      // Create payment intent in Firebase
      const { paymentId, clientSecret } = await createPaymentIntent(
        user.uid,
        amount,
        paymentType,
        currentStudent.id
      );
      
      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'SchoolConnect',
        customFlow: false,
        style: 'alwaysLight',
        defaultBillingDetails: {
          name: user.displayName || '',
          email: user.email || '',
        }
      });

      if (initError) {
        await recordFailedPayment(paymentId, initError.message);
        Alert.alert('Error', initError.message);
        return;
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        await recordFailedPayment(paymentId, presentError.message);
        Alert.alert('Error', presentError.message);
      } else {
        // Process successful payment
        await processPayment(paymentId, 'stripe');
        
        Alert.alert('Success', 'Payment completed successfully!');
        
        // Update payment history
        await fetchPaymentHistory();
        
        // For demo purposes, we'll just close the custom payment modal
        setShowCustomPayment(false);
        setCustomAmount('');
        setCustomPercentage('');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, we'll create a simpler payment function that doesn't rely on Stripe
  const handleSimplePayment = async (amount: number, paymentType: string) => {
    try {
      if (!user?.uid || !currentStudent?.id) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      
      setLoading(true);
      
      // Create a payment record directly in Firebase
      await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        studentId: currentStudent.id,
        amount,
        paymentType,
        status: 'completed',
        paymentMethod: 'direct',
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp(),
      });
      
      Alert.alert('Success', 'Payment completed successfully!');
      
      // Update payment history
      await fetchPaymentHistory();
      
      // Close the custom payment modal
      setShowCustomPayment(false);
      setCustomAmount('');
      setCustomPercentage('');
      
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPayment = () => {
    let amount = 0;
    
    if (customAmount && Number(customAmount) > 0) {
      amount = Number(customAmount);
    } else if (customPercentage && Number(customPercentage) > 0) {
      amount = Math.round((Number(customPercentage) / 100) * totalOutstanding);
    } else {
      Alert.alert('Invalid Amount', 'Please enter a valid amount or percentage.');
      return;
    }
    
    if (amount <= 0 || amount > totalOutstanding) {
      Alert.alert('Invalid Amount', `Please enter an amount between $1 and $${totalOutstanding}.`);
      return;
    }
    
    // Use the simple payment function for demo purposes
    handleSimplePayment(amount, 'Custom Payment');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Outstanding</Text>
        <Text style={styles.balanceAmount}>${totalOutstanding.toFixed(2)}</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity 
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={() => handleSimplePayment(totalOutstanding, 'Full Payment')}
            disabled={loading}>
            <Text style={styles.payButtonText}>
              {loading ? 'Processing...' : 'Pay Full Amount'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.customPayButton, loading && styles.payButtonDisabled]}
            onPress={() => setShowCustomPayment(true)}
            disabled={loading}>
            <Text style={styles.customPayButtonText}>Custom Payment</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Payments</Text>
        {payments
          .filter(payment => payment.status === 'pending')
          .map((payment) => (
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
                <Text style={styles.amount}>${payment.amount.toFixed(2)}</Text>
              </View>
              <View>
                <Text style={styles.dueDateLabel}>Due Date</Text>
                <Text style={styles.dueDate}>{payment.dueDate}</Text>
              </View>
              {payment.status === 'pending' && (
                <TouchableOpacity 
                  style={styles.payNowButton}
                  onPress={() => handleSimplePayment(payment.amount, payment.type)}
                  disabled={loading}>
                  <Text style={styles.payNowButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        {paymentHistory.length > 0 ? (
          paymentHistory.map((payment) => (
            <View key={payment.id} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyType}>{payment.type}</Text>
                <Text style={styles.historyDate}>{payment.date}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>-${payment.amount.toFixed(2)}</Text>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              </View>
            </View>
          ))
        ) : (
          history.map((payment) => (
            <View key={payment.id} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyType}>{payment.type}</Text>
                <Text style={styles.historyDate}>{payment.date}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>-${payment.amount.toFixed(2)}</Text>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              </View>
            </View>
          ))
        )}
      </View>

      {/* Custom Payment Modal */}
      <Modal
        visible={showCustomPayment}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomPayment(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Custom Payment</Text>
              <TouchableOpacity onPress={() => setShowCustomPayment(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Total outstanding: ${totalOutstanding.toFixed(2)}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Specific Amount ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={customAmount}
                onChangeText={(text) => {
                  setCustomAmount(text);
                  setCustomPercentage(''); // Clear percentage when amount is entered
                }}
              />
            </View>
            
            <Text style={styles.orText}>OR</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Percentage of Total (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter percentage (e.g. 10 for 10%)"
                keyboardType="numeric"
                value={customPercentage}
                onChangeText={(text) => {
                  setCustomPercentage(text);
                  setCustomAmount(''); // Clear amount when percentage is entered
                }}
              />
            </View>
            
            {customPercentage ? (
              <Text style={styles.calculatedAmount}>
                Amount: ${(Math.round((Number(customPercentage) / 100) * totalOutstanding * 100) / 100).toFixed(2)}
              </Text>
            ) : null}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCustomPayment(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.proceedButton, loading && styles.payButtonDisabled]}
                onPress={handleCustomPayment}
                disabled={loading}>
                <Text style={styles.proceedButtonText}>
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  balanceCard: {
    backgroundColor: '#2563eb',
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
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  payButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  customPayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fff',
    flex: 1,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  customPayButtonText: {
    color: '#fff',
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
    alignItems: 'center',
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
  payNowButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  payNowButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#64748b',
    marginVertical: 10,
  },
  calculatedAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 5,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  proceedButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});