import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import {useUser} from '@hooks/useUser';
import {Colors} from '@utils/Constant';
import Icon from '@components/global/Icon';
import {updateUserSubscription} from '@config/firebaseRN';
import {useAppDispatch} from '@store/reduxHook';
import AppIcon from '@assets/images/icon.png';
import {RAZORPAY_KEY_ID} from '@env';

interface PlanSelection {
  plan: 'monthly' | 'yearly';
}

const MONTHLY_PRICE = 59;
const YEARLY_PRICE = 599;

const SubscriptionScreen = () => {
  const route = useRoute<
    RouteProp<{
      SubscriptionScreen: {returnTo?: string; boardId?: string; title?: string};
    }>
  >();
  const {returnTo, boardId, title} = route.params || {};

  const navigation = useNavigation<any>();
  const {user} = useUser();

  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlanSelection = (plan: PlanSelection['plan']) => {
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      setIsProcessing(true);

      await updateUserSubscription(user?.uid ?? '', {
        isPremium: true,
        subscriptionType: selectedPlan,
        subscriptionId: paymentData.razorpay_payment_id,
        expiryDate:
          selectedPlan === 'monthly'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

      Alert.alert(
        'Subscription Successful',
        'Your account has been upgraded to Premium! You can now invite up to 10 members per board.',
        [
          {
            text: 'Continue',
            onPress: () => {
              if (returnTo) {
                navigation.navigate(
                  returnTo as never,
                  {boardId, title} as never,
                );
              } else {
                navigation.goBack();
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error updating subscription:', error);
      Alert.alert(
        'Error',
        'There was an issue updating your subscription. Please contact support.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = (): void => {
    setIsProcessing(true);

    if (!RazorpayCheckout) {
      console.error('RazorpayCheckout is not available!');
      Alert.alert(
        'Payment Error',
        'Payment gateway is not available on this device.',
      );
      setIsProcessing(false);
      return;
    }

    // Define RazorpayOptions type
    interface RazorpayOptions {
      description: string;
      image: string;
      currency: string;
      key: string;
      amount: number;
      name: string;
      prefill: {
        email: string;
        name: string;
      };
      theme: {
        color: string;
      };
    }

    const options: RazorpayOptions = {
      description: `Premium ${
        selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'
      } Subscription`,
      image: AppIcon,
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
      amount:
        selectedPlan === 'monthly' ? MONTHLY_PRICE * 100 : YEARLY_PRICE * 100,
      name: 'Trello',
      prefill: {
        email: user?.email || '',
        name: user?.username || '',
      },
      theme: {color: Colors.lightprimary},
    };

    RazorpayCheckout.open(options)
      .then((data: any) => {
        // Handle success
        handlePaymentSuccess(data);
      })
      .catch((error: any) => {
        setIsProcessing(false);
        if (error.error.code === 'BAD_REQUEST_ERROR') {
          Alert.alert(
            'Payment Failed',
            'You may have cancelled the payment or there was a delay. Please try again.',
          );
        } else if (error.error.code === 'UPI_PAYMENT_PENDING') {
          Alert.alert(
            'Payment Pending',
            'Your payment is pending. Please check your UPI app for further action.',
          );
        } else {
          Alert.alert(
            'Payment Failed',
            'Something went wrong. We appreciate your patience while we fix this.',
          );
        }

        console.log(`Error: ${error.code} | ${error.description}`);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Icon
              name="crown"
              iconFamily="MaterialCommunityIcons"
              size={32}
              color={Colors.lightprimary}
            />
            <Text style={styles.headerTitle}>Upgrade to Premium</Text>
            <Text style={styles.headerSubtitle}>
              Get more features and collaborate with up to 10 members per board
            </Text>
          </View>

          <View style={styles.plansContainer}>
            {/* Monthly Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.selectedPlan,
              ]}
              onPress={() => handlePlanSelection('monthly')}>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Monthly</Text>
                {selectedPlan === 'monthly' && (
                  <Icon
                    name="check-circle"
                    iconFamily="Feather"
                    size={20}
                    color={Colors.lightprimary}
                  />
                )}
              </View>

              <Text style={styles.planPrice}>₹{MONTHLY_PRICE}/month</Text>
              <Text style={styles.planBilling}>Billed monthly</Text>
            </TouchableOpacity>

            {/* Yearly Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'yearly' && styles.selectedPlan,
              ]}
              onPress={() => handlePlanSelection('yearly')}>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Yearly</Text>
                {selectedPlan === 'yearly' && (
                  <Icon
                    name="check-circle"
                    iconFamily="Feather"
                    size={20}
                    color={Colors.lightprimary}
                  />
                )}
              </View>

              <Text style={styles.planPrice}>₹{YEARLY_PRICE}/year</Text>
              <Text style={styles.planBilling}>
                ≈ ₹{Math.round(YEARLY_PRICE / 12)}/month (Save 16%)
              </Text>

              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>Best Value</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Premium Features</Text>

            <View style={styles.featureItem}>
              <Icon
                name="users"
                iconFamily="Feather"
                size={18}
                color={Colors.lightprimary}
              />
              <Text style={styles.featureText}>Up to 10 members per board</Text>
            </View>

            <View style={styles.featureItem}>
              <Icon
                name="bookmark"
                iconFamily="Feather"
                size={18}
                color={Colors.lightprimary}
              />
              <Text style={styles.featureText}>Unlimited boards</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handlePayment}
            disabled={isProcessing}>
            {isProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.paymentButtonText}>
                Subscribe Now • ₹
                {selectedPlan === 'monthly' ? MONTHLY_PRICE : YEARLY_PRICE}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy
            Policy. You can cancel your subscription anytime from your account
            settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.lightprimary,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: {
    width: '90%',
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.fontDark,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textgrey,
    textAlign: 'center',
    maxWidth: '90%',
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 120,
  },
  selectedPlan: {
    borderColor: Colors.lightprimary,
    backgroundColor: '#f0f7ff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 5,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.fontDark,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.fontDark,
    marginBottom: 4,
  },
  planBilling: {
    fontSize: 12,
    color: Colors.textgrey,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.lightprimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  bestValueText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.fontDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.fontDark,
  },
  paymentButton: {
    backgroundColor: Colors.lightprimary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: Colors.textgrey,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default SubscriptionScreen;
