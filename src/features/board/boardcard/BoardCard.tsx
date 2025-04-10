import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';
import CustomHeader from '@components/global/CustomHeader';
import {useHeaderHeight} from '@react-navigation/elements';
import {Board} from '@utils/Constant';

const BoardCard = () => {
  const route = useRoute();
  const {boardDetails} = route.params as {boardDetails: Board};
  console.log('==> BoardCard:item: ', boardDetails);
  //   console.log('==> BoardCard:currentUser: ', currentUser);

  const headerHeight = useHeaderHeight();

  return (
    <>
      <CustomHeader title={boardDetails.title} />

      <View style={[{paddingTop: headerHeight}]}>
        <Text>Helllo</Text>
      </View>
    </>
  );
};

export default BoardCard;

const styles = StyleSheet.create({});
