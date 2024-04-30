import { useCallback, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";

export function MindMap() {
  const initialNodes = [
    {
      id: "0",
      data: { label: "CNC心智圖" },
      position: { x: 0, y: 0 },
      type: "input",
    },
    {
      id: "1",
      data: { label: "Hello" },
      position: { x: -200, y: 50 },
    },
    {
      id: "2",
      data: { label: "World" },
      position: { x: 200, y: -50 },
    },
  ];
  const initialEdges = [
    { id: "0-1", source: "0", target: "1", label: "", type: "default" },
    { id: "0-2", source: "0", target: "2", label: "to the", type: "step" },
  ];
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
