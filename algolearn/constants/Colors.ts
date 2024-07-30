export type Theme = {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    viewBackground: string;
    card: string;
    border: string;
    notification: string;
    text: string;
    textContrast: string;
    backgroundContrast: string;
    stickyHeaderBackground: string;
    tint: string;
    tabIconDefault: string;
    tabIconSelected: string;
    tabIconHomeSelected: string;
    tabIconHomeDefault: string;
    tabIconInboxSelected: string;
    tabIconExploreSelected: string;
    tabIconChallengesSelected: string;
    tabBarBackground: string;
    buttonText: string;
    buttonBackground: string;
    placeholderText: string;
    icon: string;
    dangerBgColor: string;
    successBgColor: string;
    warningBgColor: string;
    infoBgColor: string;
    dangerTextColor: string;
    successTextColor: string;
    warningTextColor: string;
    infoTextColor: string;
    linkColor: string;
    hoverColor: string;
    activeColor: string;
    disabledColor: string;
    errorColor: string;
    alertColor: string;
    cardBackground: string;
    dismissText: string;
  };
};

const tintColorLight = '#333';
const tintColorDark = '#333';

export const DefaultTheme: Theme = {
  dark: false,
  colors: {
    primary: 'rgb(0, 122, 255)',
    background: '#FFFFFF',
    viewBackground: '#FFF',
    card: 'rgb(255, 255, 255)',
    border: '#333',
    notification: 'rgb(255, 59, 48)',
    text: '#000',
    textContrast: '#FFF',
    backgroundContrast: '#000',
    stickyHeaderBackground: '#FFF',
    tint: tintColorLight,
    tabIconDefault: '#1E1E1E',
    tabIconSelected: tintColorLight,
    tabIconHomeDefault: '#1E1E1E',
    tabIconHomeSelected: '#FCC931',
    tabIconInboxSelected: '#9F52C5',
    tabIconExploreSelected: '#25A879',
    tabIconChallengesSelected: '#1CC0CB',
    tabBarBackground: '#FFF',
    buttonText: '#fff',
    buttonBackground: '#1E1E1E',
    placeholderText: '#999',
    icon: '#333',
    dangerBgColor: '#FF0000',
    successBgColor: '#28a745',
    warningBgColor: '#ffc107',
    infoBgColor: '#17a2b8',
    dangerTextColor: '#fff',
    successTextColor: '#fff',
    warningTextColor: '#000',
    infoTextColor: '#fff',
    linkColor: '#1E90FF',
    hoverColor: '#555',
    activeColor: '#0000FF',
    disabledColor: '#D3D3D3',
    errorColor: '#DC3545',
    alertColor: '#FFC107',
    cardBackground: '#FFF',
    dismissText: '#636F73',
  },
};

export const DarkTheme: Theme = {
  dark: true,
  colors: {
    primary: 'rgb(0, 122, 255)',
    background: '#24272E',
    viewBackground: '#121212',
    card: 'rgb(18, 18, 18)',
    text: '#fff',
    border: '#333',
    notification: 'rgb(255, 69, 58)',
    textContrast: '#000',
    backgroundContrast: '#f1f1f1',
    stickyHeaderBackground: '#24272E',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    tabIconHomeDefault: '#1E1E1E',
    tabIconHomeSelected: '#FCC931',
    tabIconInboxSelected: '#9F52C5',
    tabIconExploreSelected: '#25A879',
    tabIconChallengesSelected: '#1CC0CB',
    tabBarBackground: '#24272E',
    buttonText: '#000',
    buttonBackground: 'white',
    placeholderText: '#666',
    icon: '#fff',
    dangerBgColor: '#FF0000',
    successBgColor: '#28a745',
    warningBgColor: '#ffc107',
    infoBgColor: '#17a2b8',
    dangerTextColor: '#fff',
    successTextColor: '#fff',
    warningTextColor: '#000',
    infoTextColor: '#fff',
    linkColor: '#1E90FF',
    hoverColor: '#AAA',
    activeColor: '#0000FF',
    disabledColor: '#555',
    errorColor: '#DC3545',
    alertColor: '#FFC107',
    cardBackground: '#24272E',
    dismissText: '#f3f3f3',
  },
};
