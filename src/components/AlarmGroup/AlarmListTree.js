import React, { useState, useEffect } from 'react';
import { Tree } from 'antd';

const AlarmListTree = ({
  treeData,
  onSelectMachineName,
  selectedKey,
  setSelectedMachineId,
}) => {
  const [expandedKeys, setExpandedKeys] = useState(['0-0-0', '0-0-1']);
  const [checkedKeys, setCheckedKeys] = useState(['0-0-0']);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  useEffect(() => {
    setSelectedKeys([selectedKey]); // 當 selectedKey 變更時更新選擇狀態
  }, [selectedKey]);

  const onExpand = (expandedKeysValue) => {
    console.log('onExpand', expandedKeysValue);
    // 确保没有重复的key被添加
    const uniqueKeys = Array.from(new Set(expandedKeysValue));
    setExpandedKeys(uniqueKeys);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeysValue) => {
    console.log('onCheck', checkedKeysValue);
    setCheckedKeys(checkedKeysValue);
  };

  const onSelect = (selectedKeysValue, info) => {
    console.log('onSelect', info);
    setSelectedKeys(selectedKeysValue);
    if (info && info.node && !info.node.children) {
      const fullName = info.node.title;
      // 使用一個不太可能出現在實際數據中的分隔符
      const parts = info.node.key.split('________');
      // 假設 key 的格式為 "Type________Series________Name"
      const series = parts.length > 1 ? parts[1] : '';
      console.log('Selected series:', series);
      onSelectMachineName(fullName, info.node.key, series);
      setSelectedMachineId(info.node.machineAddId);
    }
  };

  return (
    <Tree
      // checkable
      onExpand={onExpand}
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParent}
      onCheck={onCheck}
      checkedKeys={checkedKeys}
      onSelect={onSelect}
      selectedKeys={selectedKeys}
      treeData={treeData}
      styles={{ padding: '10px' }}
    />
  );
};
export default AlarmListTree;
