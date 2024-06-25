// import React, { useState } from "react";
// import {
//   DesktopOutlined,
//   FileOutlined,
//   PieChartOutlined,
//   TeamOutlined,
//   UserOutlined,
// } from "@ant-design/icons";
// import { Breadcrumb, Layout, Menu, theme } from "antd";
// const { Header, Content, Footer, Sider } = Layout;
// function getItem(label, key, icon, children) {
//   return {
//     key,
//     icon,
//     children,
//     label,
//   };
// }
// const items = [
//   getItem("Option 1", "1", <PieChartOutlined />),
//   getItem("Option 2", "2", <DesktopOutlined />),
//   getItem("User", "sub1", <UserOutlined />, [
//     getItem("Tom", "3"),
//     getItem("Bill", "4"),
//     getItem("Alex", "5"),
//   ]),
//   getItem("Team", "sub2", <TeamOutlined />, [
//     getItem("Team 1", "6"),
//     getItem("Team 2", "8"),
//   ]),
//   getItem("Files", "9", <FileOutlined />),
// ];

// const MenuTest = () => {
//   const [collapsed, setCollapsed] = useState(false);
//   const {
//     token: { colorBgContainer, borderRadiusLG },
//   } = theme.useToken();
//   return (
//     <Layout
//       style={{
//         minHeight: "100vh",
//       }}
//     >
//       <Sider
//         collapsible
//         collapsed={collapsed}
//         onCollapse={(value) => setCollapsed(value)}
//       >
//         <div className="demo-logo-vertical" />
//         <Menu
//           theme="dark"
//           defaultSelectedKeys={["1"]}
//           mode="inline"
//           items={items}
//         />
//       </Sider>
//       <Layout>
//         <Header
//           style={{
//             padding: 0,
//             background: colorBgContainer,
//           }}
//         />
//         <Content
//           style={{
//             margin: "0 16px",
//           }}
//         >
//           <Breadcrumb
//             style={{
//               margin: "16px 0",
//             }}
//           >
//             <Breadcrumb.Item>User</Breadcrumb.Item>
//             <Breadcrumb.Item>Bill</Breadcrumb.Item>
//           </Breadcrumb>
//           <div
//             style={{
//               padding: 24,
//               minHeight: 360,
//               background: colorBgContainer,
//               borderRadius: borderRadiusLG,
//             }}
//           >
//             Bill is a cat.
//           </div>
//         </Content>
//         <Footer
//           style={{
//             textAlign: "center",
//           }}
//         >
//           Ant Design ©{new Date().getFullYear()} Created by Ant UED
//         </Footer>
//       </Layout>
//     </Layout>
//   );
// };
// export default MenuTest;

// import React, { useEffect, useRef, useState } from "react";
// import jsMind from "jsmind"; // 確保 jsMind 已正確引入
// import "jsmind/style/jsmind.css"; // 確保 CSS 樣式已正確引入

// const MenuTest = () => {
//   const jmContainerRef = useRef(null);
//   const jmInstanceRef = useRef(null);
//   const [currentDirection, setCurrentDirection] = useState("right"); // 初始方向設為右

//   useEffect(() => {
//     const mind = {
//       meta: {
//         name: "demo",
//         author: "hizzgdev@163.com",
//         version: "0.2",
//       },
//       format: "node_array",
//       data: [
//         { id: "root", topic: "jsMind 演示", isroot: true },
//         {
//           id: "sub1",
//           topic: "右子節點1",
//           parentid: "root",
//           direction: "right",
//         },
//         { id: "sub1_1", topic: "右子節點1.1", parentid: "sub1" },
//         { id: "sub1_2", topic: "右子節點1.2", parentid: "sub1" },
//         { id: "sub2", topic: "左子節點1", parentid: "root", direction: "left" },
//         { id: "sub2_1", topic: "左子節點1.1", parentid: "sub2" },
//         { id: "sub2_2", topic: "左子節點1.2", parentid: "sub2" },
//       ],
//     };

//     const options = {
//       container: jmContainerRef.current,
//       editable: true,
//       theme: "orange",
//       mode: "full", // 支持雙向布局
//       layout: {
//         hspace: 100,
//         vspace: 50,
//         pspace: 10,
//       },
//     };

//     jmInstanceRef.current = new jsMind(options);
//     jmInstanceRef.current.show(mind);
//   }, []);

//   // 函數：添加新節點
//   const addNode = () => {
//     const newId = `node_${Date.now()}`; // 使用當前時間戳生成唯一ID
//     const newTopic = `${currentDirection === "right" ? "右" : "左"}子節點`;
//     const newNode = {
//       id: newId,
//       topic: newTopic,
//       parentid: "root",
//       direction: currentDirection,
//     };
//     jmInstanceRef.current.add_node("root", newId, newTopic, null, {
//       direction: currentDirection,
//     });
//     setCurrentDirection(currentDirection === "right" ? "left" : "right"); // 交替方向
//   };

//   return (
//     <div>
//       <div ref={jmContainerRef} style={{ height: "500px" }} />
//       <button onClick={addNode}>添加節點</button> {/* 添加節點按鈕 */}
//     </div>
//   );
// };

// export default MenuTest;

import React, { useEffect, useRef } from "react";
import jsMind from "jsmind";
import "jsmind/style/jsmind.css";

import { apiGetMachineAddMindMap } from "../utils/Api";

const MenuTest = () => {
  const jmContainerRef = useRef(null);
  const jmInstanceRef = useRef(null);

  const fetchData = async () => {
    try {
      const params = { MachineAddId: 12 };
      const data = await apiGetMachineAddMindMap(params);

      // 檢查數據是否為期望的格式
      if (
        !data ||
        !data.result ||
        !data.result.knowledgeBases ||
        !Array.isArray(data.result.knowledgeBases)
      ) {
        console.error("Unexpected data format:", data);
        return []; // 返回一個空數組，避免後續操作出錯
      }

      return data.result.knowledgeBases; // 返回 knowledgeBases 數組
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  // 將遞迴地處理每個部件和修復類型，並添加到數據陣列中
  const processPart = (part, parentId, direction) => {
    const partId = `${parentId}_${part.deviceParts.trim().replace(/\s+/g, "_")}`;
    // 父節點方向決定子節點方向
    const childDirection = direction === "right" ? "left" : "right";

    const nodes = [
      {
        id: partId,
        topic: part.deviceParts.trim(),
        parentid: parentId,
        direction: direction, // 使用從上層傳來的方向
      },
    ];

    part.repairTypes.forEach((type, index) => {
      const typeId = `${partId}_${type.repairType.trim().replace(/\s+/g, "_")}`;
      nodes.push({
        id: typeId,
        topic: type.repairType.trim(),
        parentid: partId,
        direction: childDirection, // 子節點使用相反方向
      });

      type.knowledgeBases.forEach((kb, i) => {
        const kbId = `${typeId}_kb_${kb.knowledgeBaseId}`;
        nodes.push({
          id: kbId,
          topic: kb.deviceType.trim() || "General Info",
          parentid: typeId,
          direction: childDirection, // 保持同一層級方向一致
        });
      });
    });

    return nodes;
  };

  useEffect(() => {
    fetchData()
      .then((knowledgeBases) => {
        if (knowledgeBases && knowledgeBases.length > 0) {
          const options = {
            container: jmContainerRef.current,
            editable: true,
            theme: "primary",
            mode: "full",
            layout: {
              hspace: 70,
              vspace: 30,
              pspace: 10,
            },
          };

          const nodes = [
            { id: "root", topic: "MindMap", isroot: true, direction: "right" },
          ];
          knowledgeBases.forEach((part, index) => {
            // 為每個部分交替設定方向
            const direction = index % 2 === 0 ? "right" : "left";
            nodes.push(...processPart(part, "root", direction));
          });

          const mind = {
            meta: {
              name: "demo",
              author: "hizzgdev@163.com",
              version: "0.2",
            },
            format: "node_array",
            data: nodes,
          };

          jmInstanceRef.current = new jsMind(options);
          jmInstanceRef.current.show(mind);
        } else {
          console.log("No data to display in the mind map.");
        }
      })
      .catch((error) => {
        console.error("Error in displaying mind map:", error);
      });
  }, []);

  return (
    <div>
      <div ref={jmContainerRef} style={{ height: "90vh" }} />
    </div>
  );
};

export default MenuTest;
