import { View, StyleSheet } from 'react-native';
import React from 'react';
import UserInfoRow from './UserInfoRow';
import Conditional from '@/src/components/Conditional';
import { User } from '@/src/features/user/types';
import { humanReadableDate } from '@/src/lib/utils/date';

interface ReadOnlyUserInfoProps {
  user: User;
  section: 'personal' | 'account' | 'dates' | 'status';
}

const ReadOnlyUserInfo = ({ user, section }: ReadOnlyUserInfoProps) => {
  return (
    <View>
      {section === 'account' && (
        <>
          <UserInfoRow icon="mail" label="Email" value={user.email} />
          <UserInfoRow icon="user" label="Username" value={user.username || 'N/A'} />
          <UserInfoRow icon="cpu" label="CPUS" value={`${user.cpus}`} />
          <UserInfoRow
            icon="tag"
            label="Role"
            value={`${user.role}`.charAt(0).toUpperCase() + `${user.role}`.slice(1)}
          />
        </>
      )}

      {section === 'personal' && (
        <>
          <Conditional
            condition={!!(user.firstName || user.lastName)}
            renderTrue={() => (
              <UserInfoRow
                icon="user"
                label="Name"
                value={`${user.firstName || ''} ${user.lastName || ''}`}
              />
            )}
            renderFalse={null}
          />

          <Conditional
            condition={!!user.location}
            renderTrue={() => (
              <UserInfoRow icon="map-pin" label="Location" value={user.location || ''} />
            )}
            renderFalse={null}
          />
        </>
      )}

      {section === 'dates' && (
        <>
          <UserInfoRow icon="calendar" label="Created" value={humanReadableDate(user.createdAt)} />
          <UserInfoRow
            icon="clock"
            label="Last Login"
            value={humanReadableDate(user.lastLoginAt)}
          />
        </>
      )}

      {section === 'status' && (
        <>
          <UserInfoRow
            icon="check-circle"
            label="Active"
            value={user.isActive ? 'Yes' : 'No'}
            highlight={user.isActive}
          />
          <UserInfoRow
            icon="check-circle"
            label="Email Verified"
            value={user.isEmailVerified ? 'Yes' : 'No'}
            highlight={user.isEmailVerified}
          />
        </>
      )}
    </View>
  );
};

export default ReadOnlyUserInfo;
