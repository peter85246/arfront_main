import React, { useContext, useState, useRef } from 'react';
import { MyUserContext } from '../contexts/MyUserContext';
import { Link, NavLink } from 'react-router-dom';

function Nav() {

    const { myUser } = useContext(MyUserContext);

    return (
        <aside className="main-sidebar elevation-4 sidebar-dark-primary">
            <Link to="/machine" className="brand-link">
                <span className="brand-text font-weight-light">AR管理系統</span>
            </Link>
            <div className="sidebar">
                <nav className="mt-2">
                    <ul className="nav nav-pills nav-sidebar flex-column" role="menu">
                        <li className="nav-item">
                            <NavLink className={(navData) => navData.isActive ? "nav-link active" : "nav-link"} to="/machine" style={{ cursor: 'pointer' }}>
                                <i className="fas fa-microchip"></i>&nbsp;
                                <p>機器管理</p>
                            </NavLink>
                        </li>
                        {myUser && myUser.UserLevel != 2 ?
                            <li className="nav-item">
                                <NavLink className={(navData) => navData.isActive ? "nav-link active" : "nav-link"} to="/userManage" style={{ cursor: 'pointer' }}>
                                    <i className="fas fa-users"></i>&nbsp;
                                    <p>使用者管理</p>
                                </NavLink>
                            </li>
                            : <></>
                        }
                    </ul>
                </nav>
            </div>
        </aside>
    );
}


export default Nav;