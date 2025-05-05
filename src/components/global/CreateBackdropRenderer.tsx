import {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import React from 'react';

export const createBackdropRenderer = (onPress: () => void) => {
  return (props: any) => (
    <BottomSheetBackdrop
      {...props}
      opacity={0.2}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      onPress={onPress}
    />
  );
};
