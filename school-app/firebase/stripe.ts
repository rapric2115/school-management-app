import { initStripe } from '@stripe/stripe-react-native';

export const initializeStripe = async () => {
    await initStripe({
        publishableKey: 'pk_test_51I2sIXBgsCY3HNp1JpnJvt5WSbYyV1J0R5171Bj2Kh58vU7xcALbcY2bfdlaUilanoJzwZ2LBki3AP4UJQ2cLjTY000IWLT0gD',
        merchantIdentifier: 'acct_1I2sIXBgsCY3HNp1',
    });
};