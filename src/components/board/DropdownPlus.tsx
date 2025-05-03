import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import * as DropdownMenu from 'zeego/dropdown-menu';
import Icon from '@components/global/Icon';
import {navigate} from '@utils/NavigationUtils';

const DropdownPlus = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Icon name="add" size={28} iconFamily="Ionicons" color="#FFFFFF" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Group>
          {/* board */}
          <DropdownMenu.Item
            key="board"
            onSelect={() => navigate('CreateBoard')}>
            <DropdownMenu.ItemTitle>Create a board</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: 'square.split.2x1',
                pointSize: 24,
              }}></DropdownMenu.ItemIcon>
          </DropdownMenu.Item>
          {/* card */}
          {/* <DropdownMenu.Item key="card">
            <DropdownMenu.ItemTitle>Create a card</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              androidIconName="menu"
              ios={{
                name: 'square.topthird.inset.filled',
                pointSize: 24,
              }}></DropdownMenu.ItemIcon>
          </DropdownMenu.Item> */}
        </DropdownMenu.Group>

        {/* <DropdownMenu.Item key="templates" onSelect={() => {}}>
          <DropdownMenu.ItemTitle>Browse Templates</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon
            ios={{
              name: 'square.on.square.dashed',
              pointSize: 24,
            }}></DropdownMenu.ItemIcon>
        </DropdownMenu.Item> */}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default DropdownPlus;

const styles = StyleSheet.create({});
