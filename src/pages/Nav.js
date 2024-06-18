import React, { useContext, useState, useEffect, useRef } from "react";
import { MyUserContext } from "../contexts/MyUserContext";
import { Link, NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

function Nav() {
  const { myUser } = useContext(MyUserContext);
  const [dropMenuOpen, setDropMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // 新增狀態來記錄當前被選中的選項
  const location = useLocation(); // 使用 useLocation 鉤子來獲取當前的路由位置

  useEffect(() => {
    // 根據當前的路由位置來設置 selectedItem
    const path = location.pathname;
    if (path.includes("/machine")) {
      setSelectedItem("machine");
      setDropMenuOpen(false);
    } else if (path.includes("/userManage")) {
      setSelectedItem("userManage");
      setDropMenuOpen(false);
    } else if (
      path.includes("/knowledge") ||
      path.includes("/alarm") ||
      path.includes("/pageMindMap") ||
      path.includes("/document-editor") ||
      path.includes("/sop2") ||
      path.includes("/database") ||
      path.includes("/repairDocument")
    ) {
      setDropMenuOpen(true); // 保持下拉菜單打開
      if (
        path.includes("/knowledge") ||
        path.includes("/document-editor") ||
        path.includes("/sop2") ||
        path.includes("/database") ||
        path.includes("/repairDocument")
      ) {
        setSelectedItem("knowledge");
      } else {
        setSelectedItem("alarm");
      }
    } else if (path.includes("/gpt")) {
      setSelectedItem("gpt");
      setDropMenuOpen(false);
    } else {
      setSelectedItem(null);
      setDropMenuOpen(false); // 關閉下拉菜單
    }
  }, [location]); // 當 location 變化時重新運行此效果

  // 新增函數來處理導航項目的點擊事件
  const handleNavClick = (item) => {
    setSelectedItem(item);
    setDropMenuOpen(false); // 關閉下拉菜單
  };

  return (
    <aside className="main-sidebar elevation-4 sidebar-dark-primary">
      <Link to="/machine" className="brand-link">
        <span
          className="brand-text font-weight-light"
          style={{ marginLeft: "15px" }}
        >
          AR管理系統
        </span>
      </Link>
      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" role="menu">
            {/* AR設備控制 */}
            <li className="nav-item">
              <NavLink
                className={(navData) =>
                  navData.isActive ? "nav-link active" : "nav-link"
                }
                to="/machine"
                style={{ cursor: "pointer" }}
                onClick={() => handleNavClick("machine")} // 使用 handleNavClick 函數
              >
                <i className="fas fa-microchip"></i>&nbsp;
                <p>AR設備控制</p>
              </NavLink>
            </li>

            {/* 使用者管理 */}
            {myUser && myUser.UserLevel !== 2 ? (
              <li className="nav-item">
                <NavLink
                  className={(navData) =>
                    navData.isActive ? "nav-link active" : "nav-link"
                  }
                  to="/userManage"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleNavClick("userManage")} // 使用 handleNavClick 函數
                >
                  <i className="fas fa-users"></i>&nbsp;
                  <p>使用者管理</p>
                </NavLink>
              </li>
            ) : (
              <></>
            )}

            <li className="nav-item">
              <NavLink
                className={(navData) =>
                  navData.isActive ? "nav-link active" : "nav-link"
                }
                to="/machineKnowledge"
                style={{ cursor: "pointer" }}
                onClick={() => handleNavClick("machineKnowledge")} // 使用 handleNavClick 函數
              >
                <i className="fa fa-cog" aria-hidden="true"></i>
                <p style={{ marginLeft: "2px" }}>機台管理</p>
              </NavLink>
            </li>

            <li
              className={"nav-item"}
              style={{
                cursor: "pointer",
                background: dropMenuOpen ? "#266DF7" : "",
              }}
              onClick={() => setDropMenuOpen((prev) => !prev)}
            >
              <span className="nav-link">
                <i
                  style={{
                    color: dropMenuOpen ? "white" : "#c2c1c1",
                    paddingLeft: "1px",
                  }}
                  className="fa fa-database"
                ></i>
                &nbsp;
                <p
                  style={{
                    color: dropMenuOpen ? "white" : "#c2c1c1",
                    paddingLeft: "1px",
                  }}
                >
                  知識管理
                </p>
              </span>
            </li>
            {dropMenuOpen && (
              <li style={{ background: "#4a4c5b", borderRadius: "5px" }}>
                <NavLink
                  className={(navData) =>
                    navData.isActive ? "nav-link " : "nav-link"
                  }
                  to="/knowledge"
                  style={{
                    cursor: "pointer",
                    paddingLeft: "25px",
                    fontSize: "14px",
                    color: selectedItem === "knowledge" ? "#ffffff" : "#c2c1c1", // 根據選中狀態來控制顏色
                  }}
                  onClick={() => setSelectedItem("knowledge")} // 設置選中狀態
                >
                  <i
                    className="fas fa-angle-right"
                    style={{ marginRight: "8px" }}
                  ></i>
                  <p>知識庫</p>
                </NavLink>
                <NavLink
                  className={(navData) =>
                    navData.isActive ? "nav-link " : "nav-link"
                  }
                  to="/alarm"
                  style={{
                    cursor: "pointer",
                    paddingLeft: "25px",
                    fontSize: "14px",
                    color: selectedItem === "alarm" ? "#ffffff" : "#c2c1c1", // 根據選中狀態來控制顏色
                  }}
                  onClick={() => setSelectedItem("alarm")} // 設置選中狀態
                >
                  <i
                    className="fas fa-angle-right"
                    style={{ marginRight: "8px" }}
                  ></i>
                  <p>故障庫</p>
                </NavLink>
              </li>
            )}

            <li className="nav-item">
              <NavLink
                className={(navData) =>
                  navData.isActive ? "nav-link active" : "nav-link"
                }
                to="/gpt"
                style={{ cursor: "pointer" }}
                onClick={() => handleNavClick("gpt")} // 使用 handleNavClick 函數
              >
                <i className="fa fa-comment"></i>&nbsp;
                <p>GPT系統</p>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default Nav;

// import React, { useState, useContext } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { MyUserContext } from "../contexts/MyUserContext";
// import styles from "../scss/global.module.scss";
// import classNames from "classnames";

// import {
//   DesktopOutlined,
//   UserOutlined,
//   SettingOutlined,
//   DatabaseOutlined,
//   CommentOutlined,
//   MenuFoldOutlined,
//   MenuUnfoldOutlined,
// } from '@ant-design/icons';
// import { Button, Menu } from 'antd';
// // import './Nav.css'; // 確保這裡引入了適當的 CSS 檔案來調整版面

// function Nav() {
//   const { myUser } = useContext(MyUserContext);
//   const [collapsed, setCollapsed] = useState(false);
//   const location = useLocation();

//   const items = [
//     {
//       key: '/machine',
//       icon: <DesktopOutlined />,
//       label: <Link to="/machine">AR設備控制</Link>,
//     },
//     myUser && myUser.UserLevel !== 2 && {
//       key: '/userManage',
//       icon: <UserOutlined />,
//       label: <Link to="/userManage">使用者管理</Link>,
//     },
//     {
//       key: '/machineKnowledge',
//       icon: <SettingOutlined />,
//       label: <Link to="/machineKnowledge">機台管理</Link>,
//     },
//     {
//       key: '/knowledge',
//       icon: <DatabaseOutlined />,
//       label: <Link to="/knowledge">知識管理</Link>,
//       children: [
//         {
//           key: '/knowledge',
//           label: <Link to="/knowledge">知識庫</Link>,
//         },
//         {
//           key: '/alarm',
//           label: <Link to="/alarm">故障庫</Link>,
//         },
//       ],
//     },
//     {
//       key: '/gpt',
//       icon: <CommentOutlined />,
//       label: <Link to="/gpt">GPT系統</Link>,
//     },
//   ].filter(Boolean);

//   const toggleCollapsed = () => {
//     setCollapsed(!collapsed);
//   };

//   return (
//         <aside className="main-sidebar elevation-4 sidebar-dark-primary" >
//     <div style={{ width: collapsed ? 80 : 249.5 }}>
//       <Button
//         type="primary"
//         onClick={toggleCollapsed}
//         style={{ marginBottom: 16 }}
//       >
//         {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
//       </Button>
//       <Menu
//         defaultSelectedKeys={[location.pathname]}
//         defaultOpenKeys={['/knowledge']}
//         mode="inline"
//         theme="dark"
//         inlineCollapsed={collapsed}
//         items={items}
//       />
//     </div>

//     </aside>
//   );
// }

// export default Nav;
