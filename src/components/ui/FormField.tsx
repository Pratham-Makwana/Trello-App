import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, {FC, useEffect, useRef, useState} from 'react';
import eye from '@assets/icons/eye.png';
import eyeHide from '@assets/icons/eye-hide.png';
import {screenWidth} from '@utils/Scaling';
import {Colors} from '@utils/Constant';
// import {icons} from '../constants';
interface FormFieldProps {
  title: string;
  value: string;
  placeholder?: string;
  handleChangeText: (text: string) => void;
  otherStyles?: ViewStyle;
  onFocusChange?: (isFocused: boolean) => void;
}

const FormField: FC<
  FormFieldProps & React.ComponentProps<typeof TextInput>
> = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  onFocusChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.rowGap, otherStyles]}>
      <Text style={styles.headerTitle}>{title}</Text>

      <View style={[styles.formInput]}>
        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#fff"
          onChangeText={handleChangeText}
          secureTextEntry={title === 'Password' && !showPassword}
          autoCapitalize="none"
          style={styles.textInput}
          {...props}
        />

        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPassword}>
            <Image
              source={!showPassword ? eye : eyeHide}
              resizeMode="contain"
              style={{width: 24, height: 24, tintColor: Colors.white}}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;

const styles = StyleSheet.create({
  rowGap: {
    rowGap: 8,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '500',
  },

  formInput: {

    width: screenWidth * 0.9,
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.white,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    color: Colors.white,

    flex: 1,
  },
  showPassword : {
    width : screenWidth * 0.1,
    justifyContent : 'center',
    alignItems : 'center',
  }
});
