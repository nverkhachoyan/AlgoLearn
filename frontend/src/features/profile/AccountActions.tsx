import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import React from 'react';
import Button from '@/src/components/common/Button';

interface AccountActionsProps {
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  isDark: boolean;
}

const AccountActions = ({ onSignOut, onDeleteAccount, isDark }: AccountActionsProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.actionsCard, { backgroundColor: isDark ? colors.surface : 'white' }]}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>Account Actions</Text>

      <View style={styles.actionsContainer}>
        <Button
          title="Sign Out"
          onPress={onSignOut}
          style={styles.signOutButton}
          textStyle={{ color: colors.onSurface, fontWeight: '500' }}
          icon={{ name: 'log-out', position: 'left' }}
          iconStyle={{ color: colors.onSurface }}
        />

        <Button
          title="Delete Account"
          onPress={onDeleteAccount}
          style={styles.deleteButton}
          textStyle={{ color: 'white', fontWeight: '500' }}
          icon={{ name: 'trash-2', position: 'left' }}
          iconStyle={{ color: 'white' }}
        />
      </View>
    </View>
  );
};

export default AccountActions;

const styles = StyleSheet.create({
  actionsCard: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionsContainer: {
    gap: 15,
  },
  signOutButton: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 0,
  },
  deleteButton: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    borderWidth: 0,
  },
});
