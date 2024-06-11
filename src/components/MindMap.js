import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
  Handle,
} from "reactflow";
import "reactflow/dist/style.css";

// 自定義節點組件
const CustomNode = ({ data, id, onNodeClick }) => (
  <div
    style={{
      background: id === "1" ? "#e7e7e7" : "#fff", // 中心節點使用特殊顏色
      padding: 10,
      border: "1px solid black",
      borderRadius: 5,
      cursor: "pointer", // 讓使用者知道這是可以點擊的
    }}
    onClick={() => onNodeClick(id)} // 加入點擊事件處理器
  >
    <Handle type="target" position={Position.Left} id="left-target" />
    <div>{data.label}</div>
    <Handle type="source" position={Position.Right} id="right-source" />
    <Handle type="source" position={Position.Left} id="left-source" />
  </div>
);

const nodeTypes = {
  customNode: CustomNode,
};

// 初始化節點和邊
const initialNodes = [
  {
    id: "1",
    type: "customNode",
    position: { x: 250, y: 150 },
    data: { label: "machineName" },
  },
  {
    id: "2",
    position: { x: 450, y: 0 },
    data: { label: "KnowledgeDeviceParts" },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  },
  {
    id: "3",
    position: { x: 450, y: 150 },
    data: { label: "冷卻系統" },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  },
  {
    id: "4",
    position: { x: 450, y: 300 },
    data: { label: "主軸" },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  },
  {
    id: "5",
    position: { x: 0, y: 0 },
    data: { label: "KnowledgeDeviceParts" },
    targetPosition: Position.Right,
    sourcePosition: Position.Left,
  },
  {
    id: "6",
    position: { x: 0, y: 150 },
    data: { label: "保養調教" },
    targetPosition: Position.Right,
    sourcePosition: Position.Left,
  },
  {
    id: "7",
    position: { x: 0, y: 300 },
    data: { label: "空壓系統" },
    targetPosition: Position.Right,
    sourcePosition: Position.Left,
  },
  // 第二階層節點
  {
    id: "8",
    position: { x: 650, y: -50 },
    data: { label: "KnowledgeRepairType" },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  },
  {
    id: "9",
    position: { x: 650, y: 50 },
    data: { label: "KnowledgeRepairType" },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  },
  {
    id: "10",
    position: { x: 650, y: 125 },
    data: { label: "機械故障" },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  },
  {
    id: "11",
    position: { x: 650, y: 175 },
    data: { label: "機械故障" },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  },
  {
    id: "12",
    position: { x: 650, y: 275 },
    data: { label: "電控層面" },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  },
  {
    id: "13",
    position: { x: 650, y: 325 },
    data: { label: "電控層面" },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  },
  {
    id: "14",
    position: { x: -200, y: 0 },
    data: { label: "KnowledgeRepairType" },
    targetPosition: Position.Right,
    sourcePosition: Position.Left,
  },
  {
    id: "15",
    position: { x: -200, y: 125 },
    data: { label: "零組件" },
    targetPosition: Position.Right,
    sourcePosition: Position.Left,
  },
  {
    id: "16",
    position: { x: -200, y: 175 },
    data: { label: "零組件" },
    targetPosition: Position.Right,
    sourcePosition: Position.Left,
  },
  {
    id: "17",
    position: { x: -200, y: 275 },
    data: { label: "風扇故障" },
    targetPosition: Position.Right,
    sourcePosition: Position.Left,
  },
  {
    id: "18",
    position: { x: -200, y: 325 },
    data: { label: "風扇故障" },
    targetPosition: Position.Right,
    sourcePosition: Position.Left,
  },
  // 第三階層節點
  {
    id: "19",
    position: { x: 850, y: -150 },
    data: {
      label:
        "連接SOP資料：RepairItem: `${KnowledgeRepairItem}: ${KnowledgeAlarmCode}`",
    },
    targetPosition: Position.Left,
  },
  {
    id: "20",
    position: { x: 850, y: -25 },
    data: { label: "第三層節點2" },
    targetPosition: Position.Left,
  },
  {
    id: "21",
    position: { x: 850, y: 50 },
    data: { label: "第三層節點3" },
    targetPosition: Position.Left,
  },
  {
    id: "22",
    position: { x: 850, y: 125 },
    data: { label: "主軸油冷機故障:1004" },
    targetPosition: Position.Left,
  },
  {
    id: "23",
    position: { x: 850, y: 175 },
    data: { label: "第三層節點5" },
    targetPosition: Position.Left,
  },
  {
    id: "24",
    position: { x: 850, y: 265 },
    data: { label: "機械目前處於是車工件的狀態:2014" },
    targetPosition: Position.Left,
  },
  {
    id: "25",
    position: { x: -400, y: -27 },
    data: {
      label:
        "連接SOP資料：RepairItem: `${KnowledgeRepairItem}: ${KnowledgeAlarmCode}`",
    },
    targetPosition: Position.Right,
  },
  {
    id: "26",
    position: { x: -400, y: 125 },
    data: { label: "電線鬆脫:3021" },
    targetPosition: Position.Right,
  },
  {
    id: "27",
    position: { x: -400, y: 175 },
    data: { label: "第三層節點9" },
    targetPosition: Position.Right,
  },
  {
    id: "28",
    position: { x: -400, y: 275 },
    data: { label: "第三層節點10" },
    targetPosition: Position.Right,
  },
  {
    id: "29",
    position: { x: -400, y: 325 },
    data: { label: "風扇馬達機故障:1008" },
    targetPosition: Position.Right,
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", sourceHandle: "right-source", animated: true },
  { id: "e1-3", source: "1", target: "3", sourceHandle: "right-source" },
  { id: "e1-4", source: "1", target: "4", sourceHandle: "right-source" },
  { id: "e1-5", source: "1", target: "5", sourceHandle: "left-source" },
  { id: "e1-6", source: "1", target: "6", sourceHandle: "left-source" },
  { id: "e1-7", source: "1", target: "7", sourceHandle: "left-source" },
  // 第二階層邊
  { id: "e2-8", source: "2", target: "8", sourceHandle: "right-source", animated: true },
  { id: "e2-9", source: "2", target: "9", sourceHandle: "right-source" },
  { id: "e3-10", source: "3", target: "10", sourceHandle: "right-source" },
  { id: "e3-11", source: "3", target: "11", sourceHandle: "right-source" },
  { id: "e4-12", source: "4", target: "12", sourceHandle: "right-source" },
  { id: "e4-13", source: "4", target: "13", sourceHandle: "right-source" },
  { id: "e5-14", source: "5", target: "14", sourceHandle: "left-source" },
  { id: "e6-15", source: "6", target: "15", sourceHandle: "left-source" },
  { id: "e6-16", source: "6", target: "16", sourceHandle: "left-source" },
  { id: "e7-17", source: "7", target: "17", sourceHandle: "left-source" },
  { id: "e7-18", source: "7", target: "18", sourceHandle: "left-source" },
  // 第三階層邊
  { id: "e8-19", source: "8", target: "19", sourceHandle: "right-source", animated: true },
  { id: "e8-20", source: "8", target: "20", sourceHandle: "right-source" },
  { id: "e9-21", source: "9", target: "21", sourceHandle: "right-source" },
  { id: "e10-22", source: "10", target: "22", sourceHandle: "right-source" },
  { id: "e11-23", source: "11", target: "23", sourceHandle: "right-source" },
  { id: "e12-24", source: "12", target: "24", sourceHandle: "right-source" },
  { id: "e14-25", source: "14", target: "25", sourceHandle: "left-source" },
  { id: "e15-26", source: "15", target: "26", sourceHandle: "left-source" },
  { id: "e16-27", source: "16", target: "27", sourceHandle: "left-source" },
  { id: "e17-28", source: "17", target: "28", sourceHandle: "left-source" },
  { id: "e18-29", source: "18", target: "29", sourceHandle: "left-source" },
];

const MindMap = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [activeNode, setActiveNode] = useState(null); // 新增狀態來追蹤活躍節點

  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    [],
  );

  const onNodeClick = useCallback(
    (nodeId) => {
      setActiveNode(nodeId); // 更新活躍節點
      // 只更新與活躍節點相連的邊的動畫狀態
      setEdges((els) =>
        els.map((edge) => ({
          ...edge,
          animated: edge.source === nodeId || edge.target === nodeId,
        })),
      );
    },
    [setEdges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      nodeTypes={nodeTypes}
      style={{ cursor: "pointer" }} // 設置鼠標指樣式為指針形狀
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export default MindMap;
