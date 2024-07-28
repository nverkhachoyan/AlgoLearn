// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { fetchUser, deleteAccount } from '@/services/authService';
// import { useMutation, useQuery } from '@tanstack/react-query';
// import { useState } from 'react';

// export const useAuth = () => {
//   const [isAuthed, setIsAuthed] = useState(false);
//   const [token, setToken] = useState('');

//   const {
//     isPending: isUserPending,
//     error: userError,
//     data: user,
//   } = useQuery({
//     queryKey: ['user'],
//     queryFn: async () => {
//       const authToken = await AsyncStorage.getItem('authToken');
//       if (authToken) {
//         return fetchUser(authToken);
//       } else {
//         return null;
//       }
//     },
//   });

//   const {
//     data: deleteAccountData,
//     mutate: deleteAccountMutate,
//     isPending: isDeleteAccountPending,
//     error: deleteAccountError,
//   } = useMutation({
//     mutationFn: async () => {
//       const token = await AsyncStorage.getItem('authToken');
//       if (!token) throw new Error('No token available');
//       const data = await deleteAccount(token);
//       return data;
//     },
//   });

//   const { mutate: signOut } = useMutation({
//     mutationFn: async () => {
//       await AsyncStorage.removeItem('authToken');
//       setIsAuthed(false);
//       setToken('');
//     },
//   });

//   const handleSuccess = async (newToken: string) => {
//     await AsyncStorage.setItem('authToken', newToken);
//     setIsAuthed(true);
//     setToken(newToken);
//   };

//   const checkAuthState = async () => {
//     try {
//       const authToken = await AsyncStorage.getItem('authToken');
//       if (authToken) {
//         setIsAuthed(true);
//       }
//     } catch (error) {
//       console.error('Failed to check auth state:', error);
//     }
//   };

//   return {
//     isAuthed,
//     isUserPending,
//     userError,
//     user,
//     deleteAccountData,
//     deleteAccountMutate,
//     signOut,
//     handleSuccess,
//     token,
//     checkAuthState,
//   };
// };
