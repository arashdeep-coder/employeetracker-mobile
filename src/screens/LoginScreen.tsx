import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar, HelperText } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../constants/config';

/**
 * Login Screen for employees.
 * Requires phone number and 4-digit PIN.
 */
function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  const handleLogin = async () => {
    if (phone.length !== 10) {
      setError('Phone number must be 10 digits');
      setVisible(true);
      return;
    }
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      setVisible(true);
      return;
    }

    try {
      await login(phone, pin);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(msg);
      setVisible(true);
    }
  };

  const isButtonDisabled = phone.length !== 10 || pin.length !== 4 || isLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
          <Text variant="displaySmall" style={styles.title}>Haazri</Text>
          <Text variant="titleMedium" style={styles.subtitle}>Employee Attendance</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="numeric"
            maxLength={10}
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
            disabled={isLoading}
          />
          <HelperText type="info" visible={phone.length > 0 && phone.length < 10}>
            Enter 10 digit phone number
          </HelperText>

          <TextInput
            label="4-Digit PIN"
            value={pin}
            onChangeText={setPin}
            mode="outlined"
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            disabled={isLoading}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isButtonDisabled}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor={THEME.primary}
          >
            Login
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={{ backgroundColor: THEME.error }}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: THEME.primary,
  },
  subtitle: {
    color: '#666',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
  },
  buttonContent: {
    height: 56,
  },
});

export default LoginScreen;
