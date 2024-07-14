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

import React, { useEffect, useRef, useState } from 'react';
import jsMind from 'jsmind';
import 'jsmind/style/jsmind.css';
import { useNavigate, useLocation, Link  } from 'react-router-dom';
import { apiGetMachineAddMindMap } from '../utils/Api';
import stylesAlarm from '../scss/Alarm.module.scss';
import classNames from 'classnames';

const MenuTest = ({ machineAddId, machineName, defaultZoom = 1 }) => {
  console.log('MachineAddId in MenuTest:', machineAddId); // Debug 輸出
  const jmContainerRef = useRef(null);
  const jmInstanceRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState('75vh');

  const navigate = useNavigate();

  // 節點點擊事件的處理函數，導航到 database 頁面
  // const handleNodeClick = (event, data) => {
  //   console.log("Clicked node ID:", data.node.id); // 输出被点击的节点ID
  //   if (data.node.isbutton) {
  //       const parts = data.node.id.split('_');
  //       const knowledgeBaseId = parts.length > 2 ? parts[2] : null;
  //       console.log("Knowledge Base ID:", knowledgeBaseId); // 输出knowledgeBaseId

  //       if (knowledgeBaseId) {
  //           navigate(`/database?knowledgeBaseId=${knowledgeBaseId}`);
  //       } else {
  //           navigate('/database');
  //       }
  //   }
  // };

  // const handleNodeClick = (event, data) => {
  //   console.log("Clicked node ID:", data.node.id); // 輸出被點擊的節點ID
  //   if (data.node.id.includes('_button')) {
  //     navigate('/database'); // 直接導航到 database 頁面，不檢查 knowledgeBaseId
  //   }
  // };

  const handleNodeClick = (event, data) => {
    console.log("Clicked node ID:", data.node.id); // 輸出被點擊的節點ID
    // 檢查點擊的節點是否為按鈕
    if (data.node.isbutton) {
      // 檢查節點ID是否包含'button'字樣
      if (data.node.id.includes('_button')) {
        // 假設每個按鈕節點的ID格式為 typeId_button_knowledgeBaseId
        const parts = data.node.id.split('_button_');
        const knowledgeBaseId = parts[1]; // 獲取 knowledgeBaseId
        // 根據是否有 knowledgeBaseId 導航到相應的頁面
        if (knowledgeBaseId) {
          navigate(`/database?knowledgeBaseId=${knowledgeBaseId}`);
        } else {
          navigate('/database'); // 如果沒有 knowledgeBaseId，導航到一般的 database 頁面
        }
      }
    }
  };
  
  
  // 添加節點點擊事件的處理函數
  // const handleNodeClick = (event, data) => {
  //   // 檢查節點 ID 是否符合導航到 database 的格式
  //   if (data.node.id.startsWith('root_') && data.node.id.includes('_kb_')) {
  //       const knowledgeBaseId = data.node.id.split('_kb_')[1];
  //       // 假設 knowledgeInfo 和 SOPData 以適當方式被 MenuTest 組件接收
  //       const relevantKnowledge = knowledgeInfo.find(k => k.knowledgeBaseId === knowledgeBaseId);
  //       const relevantSOP = SOPData.find(s => s.knowledgeBaseId === knowledgeBaseId);
  //       navigate('/database', { state: { item: { knowledgeBaseId, ...relevantKnowledge }, SOPData: relevantSOP } });
  //   }
  // };

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
        'font-size': 12, // 調整字體大小
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
        'font-size': 12, // 調整字體大小
        width: 'auto', // 調整寬度
      });

      type.knowledgeBases.forEach((kb) => {
        const kbId = kb.knowledgeBaseId ? `${typeId}_button_${kb.knowledgeBaseId}` : `${typeId}_button`;
        nodes.push({
            id: kbId,
            topic: kb.deviceType.trim() || 'General Info',
            parentid: typeId,
            direction: childDirection,
            'font-size': 12,
            width: 'auto',
            isbutton: true, // 设置为 button 形式
        });
      });

      // Ensure the last node is always treated as a button even if no knowledgeBases exist
      if (type.knowledgeBases.length === 0) {
        const kbId = `${typeId}_button`; // No knowledgeBaseId provided
        nodes.push({
            id: kbId,
            topic: 'General Info', // Default text
            parentid: typeId,
            direction: childDirection,
            'font-size': 12,
            width: 'auto',
            isbutton: true, // Set as a button
        });
      }
    });

    return nodes;
  };

  // 適應容器尺寸
  const adjustToFitContainer = () => {
    if (jmContainerRef.current && jmInstanceRef.current) {
      const container = jmContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const jsmindInner = jmContainerRef.current.querySelector('.jsmind-inner');
      
      if (jsmindInner) {
        const mindWidth = jsmindInner.scrollWidth;
        const mindHeight = jsmindInner.scrollHeight;
        const scaleX = containerRect.width / mindWidth;
        const scaleY = containerRect.height / mindHeight;
        const scale = Math.min(scaleX, scaleY, defaultZoom);

        // 计算居中位置
        const offsetX = (containerRect.width - mindWidth * scale) / 2;
        const offsetY = (containerRect.height - mindHeight * scale) / 2;

        // 设置样式实现缩放和居中
        jsmindInner.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        jsmindInner.style.transformOrigin = 'top left';
      }
    }
  };

  // 使用 setTimeout 确保调整缩放在心智图渲染完成后执行
  useEffect(() => {
    const timer = setTimeout(() => {
      adjustToFitContainer();
    }, 100); // 设置小延迟确保 DOM 完全加载

    return () => {
      clearTimeout(timer);
    };
  }, []); // 确保只在组件加载后执行一次

  useEffect(() => {
    // 在组件加载后和窗口调整大小时调整心智图位置和缩放
    const handleResize = () => {
      adjustToFitContainer();
    };
  
    window.addEventListener('resize', handleResize);
    handleResize(); // 初始调用以确保加载时即正确显示
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 确保只在组件加载后执行一次
  

  // 异步获取数据
  const fetchData = async () => {
    try {
      const params = { MachineAddId: machineAddId };
      const data = await apiGetMachineAddMindMap(params);
      if (
        !data ||
        !data.result ||
        !data.result.knowledgeBases ||
        !Array.isArray(data.result.knowledgeBases)
      ) {
        console.error('Unexpected data format:', data);
        return [];
      }
      return data.result.knowledgeBases;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      return [];
    }
  };

  // 獲取數據並渲染心智圖
  useEffect(() => {
    fetchData().then((knowledgeBases) => {
      if (jmContainerRef.current) {
        jmContainerRef.current.style.overflow = 'hidden'; // 初次渲染時隱藏滾動條
      }
      if (knowledgeBases.length > 0) {
        const options = {
          container: jmContainerRef.current,
          editable: false,
          theme: 'primary',
          mode: 'full',
          view: {
            engine: 'canvas',
            hmargin: 100,
            vmargin: 50,
            line_width: 2,
            line_color: '#555',
            line_style: 'curved',
            draggable: true, // 允許拖動畫布
            hide_scrollbars_when_draggable: true, // 拖動時隱藏滾動條
            zoom: {
              min: 0.5,
              max: 2.1,
              step: 0.1,
            },
            custom_node_render: function(node, element, view) {
              if (node.isbutton) {
                element.style.cursor = 'pointer'; // 鼠標懸停顯示手形
              }
            }
          },
          layout: {
            hspace: 20,
            vspace: 15,
            pspace: 10,
          },
        };

        const nodes = [{
          id: 'root',
          topic: machineName,
          isroot: true,
          direction: 'right',
          'font-size': 15,
          width: 'auto',
          'background-color': '#13466b', // jsmind接受直接設置css，深藍節點背景
          color: '#fff', // jsmind接受直接設置css，白字體
        }];

        knowledgeBases.forEach((part, index) => {
          nodes.push(...processPart(part, 'root', index % 2 === 0 ? 'right' : 'left'));
        });

        const mind = {
          meta: { name: 'demo', author: 'hizzgdev@163.com', version: '0.2' },
          format: 'node_array',
          data: nodes,
        };

        if (jmInstanceRef.current) {
          jmInstanceRef.current.destroy();  // 如果之前有实例，先销毁
        }

        jmInstanceRef.current = new jsMind(options);
        jmInstanceRef.current.show(mind);
        jmInstanceRef.current.add_event_listener('click', handleNodeClick);

        setTimeout(() => {
          adjustToFitContainer(); // 調整畫布尺寸以適應容器
        }, 0);
      }
    }).catch((error) => {
      console.error('Error in displaying mind map:', error);
    });
  }, [machineAddId, machineName, defaultZoom, navigate]);

  return (
    <div className='mindMap-container'>
      <div
        ref={jmContainerRef}
        style={{ width: '100%', height: containerHeight, overflow: 'hidden' }}
      />
    </div>
  );
};

export default MenuTest;
