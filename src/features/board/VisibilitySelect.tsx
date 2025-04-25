import {View} from 'react-native';
import React from 'react';
import WorkSpaceVisibility from '@components/board/WorkSpaceVisibility';
import {useBoard} from '@context/BoardContext';
import {useUser} from '@hooks/useUser';

const VisibilitySelect = () => {
  const {user} = useUser();
  const {selectedWorkSpace, setSelectedWorkSpace} = useBoard();
  return (
    <View style={{marginVertical: 50}}>
      <WorkSpaceVisibility
        title="Private"
        selected={selectedWorkSpace}
        subTitle={`Board memebers and ${user?.username}'s workspace workspace admins can see and edit this board`}
        iconName="lock-closed-outline"
        iconFamily="Ionicons"
        size={22}
        setSelected={() => setSelectedWorkSpace('Private')}
      />
      <WorkSpaceVisibility
        title="Workspace"
        selected={selectedWorkSpace}
        subTitle={`Anyone in the ${user?.username}'s workspace, workspace can see this board`}
        iconName="people-outline"
        iconFamily="Ionicons"
        size={22}
        setSelected={() => setSelectedWorkSpace('Workspace')}
      />
    </View>
  );
};

export default VisibilitySelect;
