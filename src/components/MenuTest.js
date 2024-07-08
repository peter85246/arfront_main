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

import React, { useEffect, useRef } from 'react';
import jsMind from 'jsmind';
import 'jsmind/style/jsmind.css';
import { useNavigate } from 'react-router-dom';
import { apiGetMachineAddMindMap } from '../utils/Api';

const MenuTest = ({ machineAddId, defaultZoom = 1 }) => {
  console.log("MachineAddId in MenuTest:", machineAddId); // Debug 輸出
  const jmContainerRef = useRef(null);
  const jmInstanceRef = useRef(null);

  const navigate = useNavigate();

  // 添加節點點擊事件的處理函數
  const handleNodeClick = (event, data) => {
    // 檢查節點 ID 是否符合導航到 database 的格式
    if (data.node.id.startsWith('root_') && data.node.id.includes('_kb_')) {
      const knowledgeBaseId = data.node.id.split('_kb_')[1];
      navigate(`/database`, { state: { knowledgeBaseId: knowledgeBaseId } });
    }
  };

  // 这个函数负责处理每个部件和维修类型，并将它们添加到数据数组中
  const processPart = (part, parentId, direction) => {
    const partId = `${parentId}_${part.deviceParts.trim().replace(/\s+/g, '_')}`;
    const childDirection = direction === 'right' ? 'left' : 'right';

    const nodes = [
      {
        id: partId,
        topic: part.deviceParts.trim(),
        parentid: parentId,
        direction: direction,
        'font-size': 13, // 調整字體大小
        width: 'auto', // 調整寬度
      },
    ];

    part.repairTypes.forEach((type) => {
      const typeId = `${partId}_${type.repairType.trim().replace(/\s+/g, '_')}`;
      nodes.push({
        id: typeId,
        topic: type.repairType.trim(),
        parentid: partId,
        direction: childDirection,
        'font-size': 13, // 調整字體大小
        width: 'auto', // 調整寬度
      });

      type.knowledgeBases.forEach((kb) => {
        const kbId = `${typeId}_kb_${kb.knowledgeBaseId}`;
        nodes.push({
          id: kbId,
          topic: kb.deviceType.trim() || 'General Info',
          parentid: typeId,
          direction: childDirection,
          'font-size': 13, // 調整字體大小
          width: 'auto', // 調整寬度
        });
      });
    });

    return nodes;
  };

  // 适应容器尺寸的函数
  const adjustToFitContainer = () => {
    if (jmContainerRef.current && jmInstanceRef.current) {
      const container = jmContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const mindSize = jmInstanceRef.current.get_size();
      const scaleX = containerRect.width / mindSize.w;
      const scaleY = containerRect.height / mindSize.h;
      const scale = Math.min(scaleX, scaleY, 1); // 避免放大
      jmInstanceRef.current.view.zoom(scale); // 调整 zoom 级别
    }
  };

  // 异步获取数据
  const fetchData = async () => {
    try {
      const params = { MachineAddId: machineAddId };
      const data = await apiGetMachineAddMindMap(params);
      if (!data || !data.result || !data.result.knowledgeBases || !Array.isArray(data.result.knowledgeBases)) {
        console.error('Unexpected data format:', data);
        return [];
      }
      return data.result.knowledgeBases;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchData().then((knowledgeBases) => {
      if (jmContainerRef.current) {
        jmContainerRef.current.style.overflow = 'hidden';  // 初次渲染時隱藏滾動條
      }
      
      if (knowledgeBases.length > 0) {
        const options = {
          container: jmContainerRef.current,
          editable: false,
          theme: 'primary',
          mode: 'full',
          layout: {
            hspace: 20, // 可以根据需要调整这些值
            vspace: 15,
            pspace: 10,
          },
        };
  
        const nodes = [{ id: 'root', topic: 'MindMap', isroot: true, direction: 'right', 'font-size': 18, width: 'auto'}];
        knowledgeBases.forEach((part, index) => {
          nodes.push(...processPart(part, 'root', index % 2 === 0 ? 'right' : 'left'));
        });
  
        const mind = {
          meta: { name: 'demo', author: 'hizzgdev@163.com', version: '0.2' },
          format: 'node_array',
          data: nodes,
        };
  
        jmInstanceRef.current = new jsMind(options);
        jmInstanceRef.current.show(mind);

        // 添加節點點擊事件監聽
        jmInstanceRef.current.add_event_listener('click', handleNodeClick);
  
        // 等待心智图渲染完成后进行缩放调整
        setTimeout(() => {
          const contentWidth = jmContainerRef.current.querySelector('.jsmind-inner').offsetWidth;
          const contentHeight = jmContainerRef.current.querySelector('.jsmind-inner').offsetHeight;
          const scaleX = jmContainerRef.current.offsetWidth / contentWidth;
          const scaleY = jmContainerRef.current.offsetHeight / contentHeight;
          const scale = Math.min(scaleX, scaleY, defaultZoom);  // 使用 defaultZoom 當作最大縮放比例
          jmInstanceRef.current.view.setZoom(scale); // 调整缩放比例
        }, 0);
      }
    }).catch((error) => {
      console.error('Error in displaying mind map:', error);
    });
  }, [machineAddId, defaultZoom, navigate]); // 依賴中新增 defaultZoom
  

  return (
    <div>
      <div ref={jmContainerRef} style={{ width: '100%', height: '80vh', overflow: 'hidden' }} />
    </div>
  );
};
  
export default MenuTest;