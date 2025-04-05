// import {StyleSheet, Text, TextStyle, View} from 'react-native';
// import React, {FC} from 'react';
// // import {Da, Fonts} from '@utils/Constants';

// import {RFValue} from 'react-native-responsive-fontsize';
// import { DarkColors, Fonts } from '@utils/Constant';

// interface Props {
//   variant?:
//     | 'h1'
//     | 'h2'
//     | 'h3'
//     | 'h4'
//     | 'h5'
//     | 'h6'
//     | 'h7'
//     | 'h8'
//     | 'h9'
//     | 'body';
//   fontFamily?: Fonts;
//   fontSize?: number;
//   style?: TextStyle | TextStyle[];
//   children?: React.ReactNode;
//   numberOfLines?: number;
//   onLayout?: (event: Object) => void;
// }

// const CustomeText: FC<Props> = ({
//   variant = 'body',
//   fontFamily = Fonts.Regular,
//   fontSize,
//   style,
//   children,
//   numberOfLines,
//   onLayout,
//   ...props
// }) => {
//   let computedFontSize: number;

//   switch (variant) {
//     case 'h1':
//       computedFontSize = RFValue(fontSize || 22);
//       break;
//     case 'h2':
//       computedFontSize = RFValue(fontSize || 20);
//       break;
//     case 'h3':
//       computedFontSize = RFValue(fontSize || 18);
//       break;
//     case 'h4':
//       computedFontSize = RFValue(fontSize || 16);
//       break;
//     case 'h5':
//       computedFontSize = RFValue(fontSize || 14);
//       break;
//     case 'h6':
//       computedFontSize = RFValue(fontSize || 12);
//       break;
//     case 'h7':
//       computedFontSize = RFValue(fontSize || 12);
//       break;
//     case 'h8':
//       computedFontSize = RFValue(fontSize || 10);
//       break;
//     case 'h9':
//       computedFontSize = RFValue(fontSize || 9);
//       break;
//     case 'body':
//       computedFontSize = RFValue(fontSize || 12);
//       break;
//   }

//   const fontFamilyStyle = {fontFamily};
//   return (
//     <Text
//       onLayout={onLayout}
//       style={[
//         styles.text,
//         {color: DarkColors.white, fontSize: computedFontSize},
//         fontFamilyStyle,
//         style,
//       ]}
//       numberOfLines={numberOfLines !== undefined ? numberOfLines : undefined}>
//       {children}
//     </Text>
//   );
// };

// export default CustomeText;

// const styles = StyleSheet.create({
//   text: {
//     textAlign: 'left',
//   },
// });

import {Platform, StyleSheet, Text, TextStyle} from 'react-native';
import React, {FC} from 'react';
import {RFValue} from 'react-native-responsive-fontsize';
import {DarkColors} from '@utils/Constant';

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7';
type PlatformType = 'android' | 'ios';

const fontSizeMap: Record<Variant, Record<PlatformType, number>> = {
  h1: {
    android: 24,
    ios: 22,
  },
  h2: {
    android: 22,
    ios: 20,
  },
  h3: {
    android: 20,
    ios: 18,
  },
  h4: {
    android: 18,
    ios: 16,
  },
  h5: {
    android: 16,
    ios: 14,
  },
  h6: {
    android: 12,
    ios: 10,
  },
  h7: {
    android: 10,
    ios: 9,
  },
};

interface CustomTextProps {
  variant?: Variant;
  fontFamily?:
    | 'Montserrat-Regular'
    | 'Montserrat-Medium'
    | 'Montserrat-Light'
    | 'Montserrat-SemiBold'
    | 'Montserrat-Bold'
    | 'Montserrat-Black'
    | 'SpaceMono-Regular';
  fontSize?: number;
  color?: string;
  style?: TextStyle | TextStyle[];
  children?: React.ReactNode;
  numberOfLines?: number;
  onLayout?: (event: any) => void;
}

const CustomText: FC<CustomTextProps> = ({
  variant,
  fontFamily = 'Montserrat-Regular',
  fontSize,
  style,
  color,
  children,
  numberOfLines,
  onLayout,
  ...props
}) => {
  let computedFontSize: number =
    Platform.OS == 'android'
      ? RFValue(fontSize || 12)
      : RFValue(fontSize || 10);

  if (variant && fontSizeMap[variant]) {
    const defaultSize = fontSizeMap[variant][Platform.OS as PlatformType];
    computedFontSize = RFValue(fontSize || defaultSize);
  }

  const fontFamilyStyle = {
    fontFamily,
  };
  return (
    <Text
      numberOfLines={numberOfLines !== undefined ? numberOfLines : undefined}
      onLayout={onLayout}
      style={[
        styles.text,
        {color: color || DarkColors.white, fontSize: computedFontSize},
        fontFamilyStyle,
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
};

export default CustomText;

const styles = StyleSheet.create({
  text: {
    textAlign: 'left',
  },
});
