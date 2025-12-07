// Roboto (Primary Font) - All weights
import {
  useFonts,
  Roboto_100Thin,
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
  Roboto_100Thin_Italic,
  Roboto_300Light_Italic,
  Roboto_400Regular_Italic,
  Roboto_500Medium_Italic,
  Roboto_700Bold_Italic,
  Roboto_900Black_Italic,
} from '@expo-google-fonts/roboto';

// Inter (Secondary Font) - All weights
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  Inter_100Thin_Italic,
  Inter_200ExtraLight_Italic,
  Inter_300Light_Italic,
  Inter_400Regular_Italic,
  Inter_500Medium_Italic,
  Inter_600SemiBold_Italic,
  Inter_700Bold_Italic,
  Inter_800ExtraBold_Italic,
  Inter_900Black_Italic,
} from '@expo-google-fonts/inter';

// Custom hook to load all fonts
export const useAppFonts = () => {
  return useFonts({
    // Roboto (Primary)
    'Roboto-Thin': Roboto_100Thin,
    'Roboto-Light': Roboto_300Light,
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Medium': Roboto_500Medium,
    'Roboto-Bold': Roboto_700Bold,
    'Roboto-Black': Roboto_900Black,
    'Roboto-ThinItalic': Roboto_100Thin_Italic,
    'Roboto-LightItalic': Roboto_300Light_Italic,
    'Roboto-Italic': Roboto_400Regular_Italic,
    'Roboto-MediumItalic': Roboto_500Medium_Italic,
    'Roboto-BoldItalic': Roboto_700Bold_Italic,
    'Roboto-BlackItalic': Roboto_900Black_Italic,
    
    // Inter (Secondary)
    'Inter-Thin': Inter_100Thin,
    'Inter-ExtraLight': Inter_200ExtraLight,
    'Inter-Light': Inter_300Light,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
    'Inter-Black': Inter_900Black,
    'Inter-ThinItalic': Inter_100Thin_Italic,
    'Inter-ExtraLightItalic': Inter_200ExtraLight_Italic,
    'Inter-LightItalic': Inter_300Light_Italic,
    'Inter-Italic': Inter_400Regular_Italic,
    'Inter-MediumItalic': Inter_500Medium_Italic,
    'Inter-SemiBoldItalic': Inter_600SemiBold_Italic,
    'Inter-BoldItalic': Inter_700Bold_Italic,
    'Inter-ExtraBoldItalic': Inter_800ExtraBold_Italic,
    'Inter-BlackItalic': Inter_900Black_Italic,
  });
};

// Font families for easy usage
export const FontFamily = {
  // Primary Font (Roboto)
  primary: {
    thin: 'Roboto-Thin',
    light: 'Roboto-Light',
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    black: 'Roboto-Black',
    thinItalic: 'Roboto-ThinItalic',
    lightItalic: 'Roboto-LightItalic',
    italic: 'Roboto-Italic',
    mediumItalic: 'Roboto-MediumItalic',
    boldItalic: 'Roboto-BoldItalic',
    blackItalic: 'Roboto-BlackItalic',
  },
  
  // Secondary Font (Inter)
  secondary: {
    thin: 'Inter-Thin',
    extraLight: 'Inter-ExtraLight',
    light: 'Inter-Light',
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    extraBold: 'Inter-ExtraBold',
    black: 'Inter-Black',
    thinItalic: 'Inter-ThinItalic',
    extraLightItalic: 'Inter-ExtraLightItalic',
    lightItalic: 'Inter-LightItalic',
    italic: 'Inter-Italic',
    mediumItalic: 'Inter-MediumItalic',
    semiBoldItalic: 'Inter-SemiBoldItalic',
    boldItalic: 'Inter-BoldItalic',
    extraBoldItalic: 'Inter-ExtraBoldItalic',
    blackItalic: 'Inter-BlackItalic',
  },
};
