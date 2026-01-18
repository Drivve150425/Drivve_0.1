import { FontFamily } from './Fonts';

export const Colors = {
  primary: '#184080',      // Main blue  1b2f4f -> 6a7e9e
  secondary: '#ED7117',    // Orange accent ffddc3 -> fc6a03
  dark: '#130F0F',         // Dark text
  light: '#ECEAE4',        // Light background
  gray: '#999999',         // Gray text
  black: '#000000',        // Pure black
  blue: '#0C4BB1',         // Alternative blue
  orange1: '#FC6A03',      // Orange variant 1
  orange2: '#FF770F',      // Orange variant 2
  white: '#FFFFFF',        // Pure white
  success: '#4CAF50',      // Success green
  error: '#F44336',        // Error red
  
  // DRIVVE Logo Colors
  logoRed: '#E23A22',      // Logo red/orange
  logoCream: '#FEECDD',    // Logo cream/beige
};

// Typography system
export const Typography = {
  // Headers (Roboto - Primary)
  h1: {
    fontFamily: FontFamily.primary.bold,
    fontSize: 32,
    lineHeight: 40,
    color: Colors.dark,
  },
  h2: {
    fontFamily: FontFamily.primary.bold,
    fontSize: 28,
    lineHeight: 36,
    color: Colors.dark,
  },
  h3: {
    fontFamily: FontFamily.primary.medium,
    fontSize: 24,
    lineHeight: 32,
    color: Colors.dark,
  },
  h4: {
    fontFamily: FontFamily.primary.medium,
    fontSize: 18,
    lineHeight: 28,
    color: Colors.dark,
  },
  
  // Body text (Inter - Secondary)
  body1: {
    fontFamily: FontFamily.secondary.regular,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.dark,
  },
  body2: {
    fontFamily: FontFamily.secondary.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.dark,
  },
  caption: {
    fontFamily: FontFamily.secondary.light,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.gray,
  },
  
  // Special text styles
  button: {
    fontFamily: FontFamily.primary.medium,
    fontSize: 16,
    lineHeight: 16,
    color: Colors.white,
  },
  input: {
    fontFamily: FontFamily.secondary.regular,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.dark,
  },
  label: {
    fontFamily: FontFamily.secondary.medium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.dark,
  },
  tab1: {
    fontFamily: FontFamily.primary.light,
    fontSize: 20,
    lineHeight: 22,
  },
  tab2: {
    fontFamily: FontFamily.primary.medium,
    fontSize: 20,
    lineHeight: 22,
  },
};

export { FontFamily };
