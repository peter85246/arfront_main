import React, { useState } from 'react';
import { Tree } from 'antd';
const treeData = [
  {
    title: '車床',
    key: '車床',
    children: [
      {
        title: 'CNC',
        key: 'CNC',
        children: [
          {
            title: 'CNC-55688',
            key: 'CNC-55688',
          },
          {
            title: 'CNC-66588',
            key: 'CNC-66588',
          },
          {
            title: 'CNC-88566',
            key: 'CNC-88566',
          },
        ],
      },
      {
        title: 'BBC',
        key: 'BBC',
        children: [
          {
            title: 'BBC-00000',
            key: 'BBC-00000',
          },
          {
            title: 'BBC-11233',
            key: 'BBC-11233',
          },
          {
            title: 'BBC-33211',
            key: 'BBC-33211',
          },
        ],
      },
    ],
  },
  {
    title: '銑床',
    key: '銑床',
    children: [
      {
        title: 'CNC',
        key: 'CNC',
        children: [
          {
            title: 'CNC-55688',
            key: 'CNC-55688',
          },
          {
            title: 'CNC-66588',
            key: 'CNC-66588',
          },
          {
            title: 'CNC-88566',
            key: 'CNC-88566',
          },
        ],
      },
      {
        title: 'BBC',
        key: 'BBC',
        children: [
          {
            title: 'BBC-00000',
            key: 'BBC-00000',
          },
          {
            title: 'BBC-11233',
            key: 'BBC-11233',
          },
          {
            title: 'BBC-33211',
            key: 'BBC-33211',
          },
        ],
      },
    ],
  },
];

const AlarmListTree = () => {
  const [expandedKeys, setExpandedKeys] = useState(['0-0-0', '0-0-1']);
  const [checkedKeys, setCheckedKeys] = useState(['0-0-0']);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const onExpand = (expandedKeysValue) => {
    console.log('onExpand', expandedKeysValue);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };
  const onCheck = (checkedKeysValue) => {
    console.log('onCheck', checkedKeysValue);
    setCheckedKeys(checkedKeysValue);
  };
  const onSelect = (selectedKeysValue, info) => {
    console.log('onSelect', info);
    setSelectedKeys(selectedKeysValue);
  };

  return (
    <Tree
      checkable
      onExpand={onExpand}
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParent}
      onCheck={onCheck}
      checkedKeys={checkedKeys}
      onSelect={onSelect}
      selectedKeys={selectedKeys}
      treeData={treeData}
      styles={{padding: "10px"}}
    />
  );
};
export default AlarmListTree;