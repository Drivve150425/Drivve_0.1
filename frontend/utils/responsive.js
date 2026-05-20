import { Dimensions } from 'react-native';
import {
  scale,
  verticalScale,
  moderateScale,
} from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');

export { width, height };

export { scale, verticalScale, moderateScale };

export const w = scale;
export const h = verticalScale;
export const m = moderateScale;

export const font = (size) => moderateScale(size);

export const spacing = (size) => moderateScale(size);

export const radius = (size) => moderateScale(size);

export const wp = (percent) => {
  return (width * percent) / 100;
};

export const hp = (percent) => {
  return (height * percent) / 100;
};