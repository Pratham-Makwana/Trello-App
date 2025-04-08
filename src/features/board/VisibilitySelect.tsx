import {View} from 'react-native';
import React, {useState} from 'react';

import WorkSpaceVisibility from '@components/board/WorkSpaceVisibility';

const VisibilitySelect = () => {
  const [selected, setSelected] = useState(false);
  return (
    <View style={{marginVertical: 50}}>
      <WorkSpaceVisibility
        title="Private"
        subTitle="Board memebers and Pratham Makwana's workspace workspace admins can
            see and edit this board"
        iconName="lock-closed-outline"
        iconFamily="Ionicons"
        size={22}
      />
      <WorkSpaceVisibility
        title="WorkSpace"
        subTitle="Anyone in the Pratham Makwana's workspace cworkspace can see this board"
        iconName="people-outline"
        iconFamily="Ionicons"
        size={22}
      />
      <WorkSpaceVisibility
        title="Public"
        subTitle="The board is public. It's visible to anyone with the link and will show up in search engines like Google. Only people added to the board can edit it."
        iconName="basketball-outline"
        iconFamily="Ionicons"
        size={22}
      />
    </View>
  );
};

export default VisibilitySelect;
