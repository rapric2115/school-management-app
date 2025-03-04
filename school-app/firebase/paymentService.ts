import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Alert } from 'react-native';

export const createPaymentIntent = async (
    userId: string,
    amount: number,
    paymentType: string,
    studentId: string
) => {
    try {
        //create a new payment record in firestore
        const paymentRef = await addDoc(collection(db, 'payment_history'), {
            userId,
            studentId,
            amount,
            paymentType,
            status: 'pending',
            createdAt: serverTimestamp(),
        });
        return {
            paymentId: paymentRef.id,
            clientSecret: `${paymentRef.id}_${Date.now()}`,
        };
    }  catch (error) {
        console.log('Error creating payment intent:', error);
        throw new Error('Failed to create payment intent');
    }
}

export const processPayment = async (
    paymentId: string,
    paymentMethod: string
) => {
    try {
        //update the payment record in firestore
        await updateDoc(doc(db, 'payment_history', paymentId), {
            status: 'completed',
            paymentMethod,
            completeAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.log('Error processing payment', error);
        throw new Error('Failed to process payment');
    }
};

export const recordFailedPayment = async (
    paymentId: string,
    errorMessage: string
) => {
    try {
        // update the payment record in firestore
        await updateDoc(doc(db, 'payment_history', paymentId), {
            status: 'failed',
            errorMessage,
            failedAt: serverTimestamp(),
        });
    } catch ( error ) {
        console.log('Error recording failed payment', error);
    }
}

export const getPaymentHistory = async (studentId: string) => {
    try {
        const paymentsRef = collection(db, 'payment_history');
        const q = query(paymentsRef, where('studentId', '==', studentId), orderBy('createdAt', 
            'desc'
        ));
        const querySnapshot = await getDoc(q);
        const payments = [];
        querySnapshot.forEach((doc) => {
            payments.push({id: doc.id, ...doc.data()});
        })
        return payments;
    } catch (error ) {
        console.log('Error getting payment history', error);
        throw new Error('failed to get payment History');
    }
}