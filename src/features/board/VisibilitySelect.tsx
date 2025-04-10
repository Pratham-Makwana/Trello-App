import {View} from 'react-native';
import React, {useState} from 'react';

import WorkSpaceVisibility from '@components/board/WorkSpaceVisibility';
import {useAuthContext} from '@context/UserContext';
import {useBoard} from '@context/BoardContext';

type WorkspaceType = 'Public' | 'Private' | 'Workspace';
const VisibilitySelect = () => {
  const {user} = useAuthContext();
  // const [selected, setSelected] = useState<WorkspaceType>('Workspace');
  const {selectedWorkSpace, setSelectedWorkSpace} = useBoard();
  return (
    <View style={{marginVertical: 50}}>
      <WorkSpaceVisibility
        title="Private"
        selected={selectedWorkSpace}
        subTitle={`Board memebers and ${user?.displayName}'s workspace workspace admins can see and edit this board`}
        iconName="lock-closed-outline"
        iconFamily="Ionicons"
        size={22}
        setSelected={() => setSelectedWorkSpace('Private')}
      />
      <WorkSpaceVisibility
        title="Workspace"
        selected={selectedWorkSpace}
        subTitle={`Anyone in the ${user?.displayName}'s workspace cworkspace can see this board`}
        iconName="people-outline"
        iconFamily="Ionicons"
        size={22}
        setSelected={() => setSelectedWorkSpace('Workspace')}
      />
      <WorkSpaceVisibility
        title="Public"
        selected={selectedWorkSpace}
        subTitle="The board is public. It's visible to anyone with the link and will show up in search engines like Google. Only people added to the board can edit it."
        iconName="basketball-outline"
        iconFamily="Ionicons"
        size={22}
        setSelected={() => setSelectedWorkSpace('Public')}
      />
    </View>
  );
};

export default VisibilitySelect;
