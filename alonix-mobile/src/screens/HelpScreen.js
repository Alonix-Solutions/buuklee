import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SHADOW_SMALL } from '../utils/shadows';

const HelpScreen = ({ navigation, route }) => {
  const { section } = route.params || {};
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(section || 'faq');

  useEffect(() => {
    if (section) {
      setActiveTab(section);
    }
  }, [section]);

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'How do I create an account?',
      answer:
        'To create an account, tap on the "Sign Up" button on the login screen. Fill in your details including name, email, and password. You\'ll receive a verification email to activate your account.',
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do I join a challenge?',
      answer:
        'Browse challenges on the Home screen, tap on one that interests you, and click the "Join Challenge" button. You can also enable ride-sharing if you need transportation.',
    },
    {
      id: 3,
      category: 'Activities',
      question: 'Can I track my activities?',
      answer:
        'Yes! When participating in a challenge, you can use the live tracking feature to record your activity. Your stats including distance, time, and elevation will be automatically tracked.',
    },
    {
      id: 4,
      category: 'Activities',
      question: 'How do I create my own challenge?',
      answer:
        'Tap the "+" button in the bottom navigation, select "Create Challenge", fill in the details including route, difficulty, date, and participant limit. Your challenge will be visible to other users.',
    },
    {
      id: 5,
      category: 'Ride Sharing',
      question: 'How does ride-sharing work?',
      answer:
        'When joining a challenge with ride-sharing available, you can request a ride from other participants. You\'ll share the cost of transportation, making it more affordable and eco-friendly.',
    },
    {
      id: 6,
      category: 'Ride Sharing',
      question: 'Is ride-sharing safe?',
      answer:
        'All drivers are verified users with ratings. You can view their profile, rating, and vehicle details before requesting a ride. We encourage users to follow safety guidelines.',
    },
    {
      id: 7,
      category: 'Bookings',
      question: 'How do I book a hotel or car?',
      answer:
        'Navigate to the Hotel or Car Rental section, browse available options, select your dates, and complete the booking. You\'ll receive a confirmation email with details.',
    },
    {
      id: 8,
      category: 'Bookings',
      question: 'Can I cancel my booking?',
      answer:
        'Yes, you can cancel bookings according to the provider\'s cancellation policy. Check the specific terms when booking. Cancellations can be made from your bookings page.',
    },
    {
      id: 9,
      category: 'Profile & Settings',
      question: 'How do I change my profile information?',
      answer:
        'Go to your Profile, tap "Edit Profile", update your information, and save. You can change your name, bio, location, profile photo, and social media links.',
    },
    {
      id: 10,
      category: 'Profile & Settings',
      question: 'How do I manage my privacy settings?',
      answer:
        'Go to Settings > Privacy to control who can see your activities, profile information, and location. You can choose between public, friends only, or private visibility.',
    },
    {
      id: 11,
      category: 'Achievements',
      question: 'How do I unlock achievements?',
      answer:
        'Complete challenges and activities to unlock achievements. Each achievement has specific requirements. Track your progress in the Achievements section.',
    },
    {
      id: 12,
      category: 'Troubleshooting',
      question: 'Why is GPS tracking not working?',
      answer:
        'Ensure location services are enabled for Alonix in your device settings. For best results, use the app outdoors with a clear view of the sky. Check that you have an active internet connection.',
    },
    {
      id: 13,
      category: 'Troubleshooting',
      question: 'App is running slowly or crashing',
      answer:
        'Try closing and reopening the app. Ensure you have the latest version installed. Clear the app cache in settings. If the problem persists, contact our support team.',
    },
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : faqs;

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const handleContactSupport = (method) => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:support@alonix.app?subject=Support Request');
        break;
      case 'phone':
        Alert.alert(
          'Contact Support',
          'Call us at: +230 5XXX XXXX\n\nHours: Mon-Fri 9AM-5PM',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => Linking.openURL('tel:+2305XXXXXXX') },
          ]
        );
        break;
      case 'chat':
        Alert.alert('Live Chat', 'Live chat coming soon! Please use email or phone support for now.');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/2305XXXXXXX?text=Hello, I need help with Alonix');
        break;
    }
  };

  const FaqItem = ({ faq }) => {
    const isExpanded = expandedFaq === faq.id;

    return (
      <TouchableOpacity
        style={styles.faqItem}
        onPress={() => setExpandedFaq(isExpanded ? null : faq.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{faq.question}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray}
          />
        </View>
        {isExpanded && (
          <Text style={styles.faqAnswer}>{faq.answer}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const ContactCard = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity
      style={styles.contactCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.contactIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.contactTitle}>{title}</Text>
      <Text style={styles.contactSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const renderFaqTab = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search FAQs..."
          placeholderTextColor={COLORS.lightGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      {/* FAQs */}
      {Object.keys(groupedFaqs).map((category) => (
        <View key={category} style={styles.faqCategory}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {groupedFaqs[category].map((faq) => (
            <FaqItem key={faq.id} faq={faq} />
          ))}
        </View>
      ))}

      {/* Empty State */}
      {filteredFaqs.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={COLORS.lightGray} />
          <Text style={styles.emptyStateText}>No FAQs found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try different keywords or contact support
          </Text>
        </View>
      )}
    </>
  );

  const renderContactTab = () => (
    <View style={styles.contactSection}>
      <Text style={styles.contactIntro}>
        Need help? Our support team is here for you!
      </Text>

      <View style={styles.contactGrid}>
        <ContactCard
          icon="mail-outline"
          title="Email"
          subtitle="support@alonix.app"
          color={COLORS.primary}
          onPress={() => handleContactSupport('email')}
        />
        <ContactCard
          icon="call-outline"
          title="Phone"
          subtitle="+230 5XXX XXXX"
          color={COLORS.success}
          onPress={() => handleContactSupport('phone')}
        />
        <ContactCard
          icon="logo-whatsapp"
          title="WhatsApp"
          subtitle="Quick response"
          color="#25D366"
          onPress={() => handleContactSupport('whatsapp')}
        />
        <ContactCard
          icon="chatbubbles-outline"
          title="Live Chat"
          subtitle="Coming soon"
          color={COLORS.info}
          onPress={() => handleContactSupport('chat')}
        />
      </View>

      <View style={styles.hoursCard}>
        <Ionicons name="time-outline" size={24} color={COLORS.primary} />
        <View style={styles.hoursText}>
          <Text style={styles.hoursTitle}>Support Hours</Text>
          <Text style={styles.hoursDetail}>Monday - Friday: 9:00 AM - 5:00 PM</Text>
          <Text style={styles.hoursDetail}>Saturday: 10:00 AM - 2:00 PM</Text>
          <Text style={styles.hoursDetail}>Sunday: Closed</Text>
        </View>
      </View>
    </View>
  );

  const renderTermsTab = () => (
    <ScrollView style={styles.legalContent}>
      <Text style={styles.legalTitle}>Terms of Service</Text>
      <Text style={styles.legalSection}>1. Acceptance of Terms</Text>
      <Text style={styles.legalText}>
        By accessing and using Alonix, you accept and agree to be bound by the terms and
        conditions of this agreement.
      </Text>

      <Text style={styles.legalSection}>2. User Accounts</Text>
      <Text style={styles.legalText}>
        You are responsible for maintaining the confidentiality of your account credentials
        and for all activities that occur under your account.
      </Text>

      <Text style={styles.legalSection}>3. User Conduct</Text>
      <Text style={styles.legalText}>
        Users must conduct themselves appropriately when using the platform. Harassment,
        abuse, or inappropriate behavior will not be tolerated.
      </Text>

      <Text style={styles.legalSection}>4. Activity Participation</Text>
      <Text style={styles.legalText}>
        Participants engage in activities at their own risk. Alonix is not responsible for
        any injuries or accidents during challenges or activities.
      </Text>

      <Text style={styles.legalSection}>5. Ride Sharing</Text>
      <Text style={styles.legalText}>
        Ride sharing is facilitated between users. Alonix is not responsible for any
        incidents that occur during shared transportation.
      </Text>

      <Text style={styles.legalSection}>6. Bookings</Text>
      <Text style={styles.legalText}>
        Hotel and car rental bookings are subject to the terms and conditions of the
        respective service providers.
      </Text>

      <Text style={styles.legalSection}>7. Changes to Terms</Text>
      <Text style={styles.legalText}>
        We reserve the right to modify these terms at any time. Users will be notified of
        significant changes.
      </Text>

      <Text style={styles.legalFooter}>Last updated: November 2025</Text>
    </ScrollView>
  );

  const renderPrivacyTab = () => (
    <ScrollView style={styles.legalContent}>
      <Text style={styles.legalTitle}>Privacy Policy</Text>

      <Text style={styles.legalSection}>1. Information We Collect</Text>
      <Text style={styles.legalText}>
        We collect information you provide when creating an account, including name, email,
        location, and profile details. We also collect activity data when you participate
        in challenges.
      </Text>

      <Text style={styles.legalSection}>2. How We Use Your Information</Text>
      <Text style={styles.legalText}>
        Your information is used to provide and improve our services, connect you with other
        users, track your activities, and send relevant notifications.
      </Text>

      <Text style={styles.legalSection}>3. Location Data</Text>
      <Text style={styles.legalText}>
        We collect location data when you participate in activities to provide tracking and
        navigation features. You can control location permissions in your device settings.
      </Text>

      <Text style={styles.legalSection}>4. Sharing Your Information</Text>
      <Text style={styles.legalText}>
        Your profile and activities may be visible to other users based on your privacy
        settings. We do not sell your personal information to third parties.
      </Text>

      <Text style={styles.legalSection}>5. Data Security</Text>
      <Text style={styles.legalText}>
        We implement security measures to protect your data. However, no method of
        transmission over the internet is 100% secure.
      </Text>

      <Text style={styles.legalSection}>6. Your Rights</Text>
      <Text style={styles.legalText}>
        You have the right to access, update, or delete your personal information. Contact
        us to exercise these rights.
      </Text>

      <Text style={styles.legalSection}>7. Cookies and Analytics</Text>
      <Text style={styles.legalText}>
        We use cookies and analytics tools to improve user experience and understand how
        our app is being used.
      </Text>

      <Text style={styles.legalSection}>8. Children's Privacy</Text>
      <Text style={styles.legalText}>
        Our service is not intended for children under 13. We do not knowingly collect
        information from children.
      </Text>

      <Text style={styles.legalFooter}>Last updated: November 2025</Text>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'faq' && styles.tabActive]}
          onPress={() => setActiveTab('faq')}
        >
          <Text style={[styles.tabText, activeTab === 'faq' && styles.tabTextActive]}>
            FAQs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.tabActive]}
          onPress={() => setActiveTab('contact')}
        >
          <Text style={[styles.tabText, activeTab === 'contact' && styles.tabTextActive]}>
            Contact
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.tabActive]}
          onPress={() => setActiveTab('terms')}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
            Terms
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.tabActive]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
            Privacy
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'faq' && renderFaqTab()}
        {activeTab === 'contact' && renderContactTab()}
        {activeTab === 'terms' && renderTermsTab()}
        {activeTab === 'privacy' && renderPrivacyTab()}

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGray,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.gray,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,

    borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass

    shadowColor: COLORS.darkGray,

    shadowOpacity: 0.1,

    shadowOffset: { width: 0, height: 2 },

    shadowRadius: 4,

    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.darkGray,
    marginLeft: 12,
  },
  faqCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
    paddingHorizontal: SIZES.padding,
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    ...SHADOW_SMALL,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    flex: 1,
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,

    borderTopColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: SIZES.base,
    color: COLORS.lightGray,
    marginTop: 8,
  },
  contactSection: {
    padding: SIZES.padding,
  },
  contactIntro: {
    fontSize: SIZES.md,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  contactCard: {
    width: '50%',
    padding: 6,
  },
  contactIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    textAlign: 'center',
  },
  hoursCard: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    ...SHADOW_SMALL,
  },
  hoursText: {
    flex: 1,
    marginLeft: 16,
  },
  hoursTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  hoursDetail: {
    fontSize: SIZES.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  legalContent: {
    padding: SIZES.padding,
  },
  legalTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 24,
  },
  legalSection: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginTop: 20,
    marginBottom: 8,
  },
  legalText: {
    fontSize: SIZES.base,
    color: COLORS.gray,
    lineHeight: 22,
    marginBottom: 12,
  },
  legalFooter: {
    fontSize: SIZES.sm,
    color: COLORS.lightGray,
    fontStyle: 'italic',
    marginTop: 24,
    textAlign: 'center',
  },
});

export default HelpScreen;
