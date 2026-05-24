import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { TextInput, Button, Text, HelperText, Icon } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../constants/config';

/**
 * Login Screen for employees.
 * Requires phone number and 4-digit PIN.
 */
function LoginScreen() {
  const { login, authMessage, setAuthMessage } = useAuth();
  const [orgCode, setOrgCode] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'error' | 'success' }>({
    visible: false,
    message: '',
    type: 'error',
  });

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  useEffect(() => {
    if (authMessage) {
      showToast(authMessage, 'error');
      setAuthMessage(null);
    }
  }, [authMessage, setAuthMessage]);

  const handleLogin = async () => {
    if (!orgCode.trim()) {
      showToast('Organization Code is required');
      return;
    }
    if (phone.length !== 10) {
      showToast('Phone number must be 10 digits');
      return;
    }
    if (pin.length !== 4) {
      showToast('PIN must be 4 digits');
      return;
    }

    try {
      setIsLoggingIn(true);
      Keyboard.dismiss(); // dismiss keyboard before logging in
      await login(orgCode.trim().toUpperCase(), phone, pin);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials and internet connection.';
      showToast(msg, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isButtonDisabled = orgCode.trim() === '' || phone.length !== 10 || pin.length !== 4 || isLoggingIn;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>Employee Attendance</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Organization Code</Text>
            <TextInput
              placeholder="Enter organization code"
              value={orgCode}
              onChangeText={(text) => setOrgCode(text.replace(/[^A-Za-z0-9]/g, ''))}
              mode="outlined"
              autoCapitalize="characters"
              style={styles.input}
              outlineColor="#E5E7EB"
              activeOutlineColor={THEME.primary}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="domain" color="#9CA3AF" />}
              disabled={isLoggingIn}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              placeholder="Enter phone number"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="numeric"
              maxLength={10}
              style={styles.input}
              outlineColor="#E5E7EB"
              activeOutlineColor={THEME.primary}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="phone" color="#9CA3AF" />}
              disabled={isLoggingIn}
            />
            {phone.length > 0 && phone.length < 10 && (
              <HelperText type="info" visible style={styles.helperText}>
                Enter 10 digit phone number
              </HelperText>
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>4-Digit PIN</Text>
            <TextInput
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChangeText={setPin}
              mode="outlined"
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              style={styles.input}
              outlineColor="#E5E7EB"
              activeOutlineColor={THEME.primary}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="lock" color="#9CA3AF" />}
              disabled={isLoggingIn}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoggingIn}
            disabled={isButtonDisabled}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor={THEME.primary}
            labelStyle={styles.buttonLabel}
            icon="arrow-right"
          >
            Login
          </Button>

          {/* <Button
            mode="text"
            onPress={() => {}}
            textColor={THEME.primary}
            style={styles.forgotButton}
            labelStyle={styles.forgotButtonText}
          >
            Forgot PIN?
          </Button> */}

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>By logging in, you agree to our</Text>
            <View style={styles.footerLinksRow}>
              <Text style={styles.footerLink}>Terms of Service</Text>
              <Text style={styles.footerText}> and </Text>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {toast.visible && (
        <View style={[styles.customToast, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
          <Icon 
            source={toast.type === 'error' ? 'close-circle-outline' : 'check-circle-outline'} 
            color={toast.type === 'error' ? '#DC2626' : THEME.primary} 
            size={24} 
          />
          <Text style={[styles.toastText, toast.type === 'error' ? styles.toastTextError : styles.toastTextSuccess]}>
            {toast.message}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    justifyContent: 'center',
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#ffffff',
    height: 52,
    fontSize: 15,
  },
  inputOutline: {
    borderRadius: 8,
  },
  helperText: {
    marginTop: 4,
    paddingHorizontal: 0,
  },
  button: {
    marginTop: 12,
    borderRadius: 8,
  },
  buttonContent: {
    height: 56,
    flexDirection: 'row-reverse',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotButton: {
    marginTop: 16,
  },
  forgotButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  footerLinksRow: {
    flexDirection: 'row',
  },
  footerLink: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '500',
  },
  customToast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 70,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 9999,
  },
  toastError: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#DC2626',
  },
  toastSuccess: {
    backgroundColor: '#F0FDF4',
    borderLeftColor: THEME.primary,
  },
  toastText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  toastTextError: {
    color: '#B91C1C',
  },
  toastTextSuccess: {
    color: THEME.primary,
  },
});

export default LoginScreen;
