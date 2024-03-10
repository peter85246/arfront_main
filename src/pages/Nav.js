import React, { useContext, useState, useRef } from "react";
import { MyUserContext } from "../contexts/MyUserContext";
import { Link, NavLink } from "react-router-dom";

function Nav() {
  const { myUser } = useContext(MyUserContext);
  const [dropMenuOpen, setDropMenuOpen] = useState(false);
  
  return (
    <aside className="main-sidebar elevation-4 sidebar-dark-primary">
      <Link to="/machine" className="brand-link">
        <span className="brand-text font-weight-light">AR管理系統</span>
      </Link>
      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" role="menu">

            <li className="nav-item">
              <NavLink
                className={(navData) =>
                  navData.isActive ? "nav-link active" : "nav-link"
                }
                to="/machine"
                style={{ cursor: "pointer" }}
              >
                <i className="fas fa-microchip"></i>&nbsp;
                <p>機器管理</p>
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
                >
                  <i className="fas fa-users"></i>&nbsp;
                  <p>使用者管理</p>
                </NavLink>
              </li>
            ) : (
              <></>
            )}

            <li
              className={"nav-item"}
              style={{ cursor: "pointer", background: dropMenuOpen ? '#266DF7' : '' }}
              onClick={() => setDropMenuOpen(prev => !prev)}
            >
              <span className="nav-link">
                <i style={{ color: dropMenuOpen ? 'white' : '#c2c7d0' }} className="fas fa-microchip"></i>&nbsp;
                <p style={{ color: dropMenuOpen ? 'white' : '#c2c7d0' }}>知識管理</p>
              </span>
            </li>
            {dropMenuOpen && (
              <li style={{ background: '#4a4c5b', borderRadius: '5px' }}>
                <NavLink
                  className={(navData) =>
                    navData.isActive ? "nav-link " : "nav-link"
                  }
                  to="/knowledge"
                  style={{ cursor: "pointer", paddingLeft: '40px', fontSize: '14px' }}
                >
                  <p>知識庫</p>
                </NavLink>
                <NavLink
                  className={(navData) =>
                    navData.isActive ? "nav-link " : "nav-link"
                  }
                  to="/alarm"
                  style={{ cursor: "pointer", paddingLeft: '40px', fontSize: '14px' }}
                >
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
              >
                <i className="fas fa-microchip"></i>&nbsp;
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
