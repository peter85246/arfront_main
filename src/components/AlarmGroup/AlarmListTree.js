import React, { useState, useEffect } from "react";
import { Tree } from "antd";

const treeData = [
  {
    title: "車床",
    key: "車床",
    children: [
      {
        title: "CNC",
        key: "CNC",
        children: [
          {
            title: "CNC-55688",
            key: "CNC-55688",
          },
          {
            title: "CNC-66588",
            key: "CNC-66588",
          },
          {
            title: "CNC-88566",
            key: "CNC-88566",
          },
        ],
      },
      {
        title: "BBC",
        key: "BBC",
        children: [
          {
            title: "BBC-00000",
            key: "BBC-00000",
          },
          {
            title: "BBC-11233",
            key: "BBC-11233",
          },
          {
            title: "BBC-33211",
            key: "BBC-33211",
          },
        ],
      },
    ],
  },
];

const AlarmListTree = ({ treeData, onSelectMachineName, selectedKey }) => {
  const [expandedKeys, setExpandedKeys] = useState(["0-0-0", "0-0-1"]);
  const [checkedKeys, setCheckedKeys] = useState(["0-0-0"]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  useEffect(() => {
    setSelectedKeys([selectedKey]); // 當 selectedKey 變更時更新選擇狀態
  }, [selectedKey]);

  const onExpand = (expandedKeysValue) => {
    console.log("onExpand", expandedKeysValue);
    // 确保没有重复的key被添加
    const uniqueKeys = Array.from(new Set(expandedKeysValue));
    setExpandedKeys(uniqueKeys);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeysValue) => {
    console.log("onCheck", checkedKeysValue);
    setCheckedKeys(checkedKeysValue);
  };

  const onSelect = (selectedKeysValue, info) => {
    console.log("onSelect", info);
    setSelectedKeys(selectedKeysValue);
    // 只有當節點是子節點（沒有子節點自己）時，才調用 onSelectMachineName
    if (info && info.node && !info.node.children) {
      onSelectMachineName(info.node.title, info.node.key);
    }
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
      styles={{ padding: "10px" }}
    />
  );
};
export default AlarmListTree;
