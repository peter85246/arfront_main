import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyUserContext } from '../contexts/MyUserContext';
import Header from './Header';
import Nav from './Nav';
import { setWindowClass, removeWindowClass, addWindowClass } from '../utils/helpers';

import {
    apiMyUserData,
} from "../utils/Api";

function Home(props) {
    const [myUser, setMyUser] = useState(null);

    //#region 初始載入
    useEffect(() => {
        removeWindowClass('login-page');

        addWindowClass('sidebar-mini');
        const fetchData = async () => {
            await refreshMyUser();
        };

        fetchData();
    }, []);
    //#endregion

    //#region 刷新MyUser
    const refreshMyUser = async () => {
        let myUserResponse = await apiMyUserData();
        if (myUserResponse) {
            if (myUserResponse.code == "0000") {
                setMyUser(myUserResponse.result);
            }
        }
    }
    //#endregion

    return (
        <MyUserContext.Provider value={{ myUser: myUser }}>
            <div className="wrapper">
                <Header />
                <Nav />

                <div className="content-wrapper">
                    {props.children}
                </div>
            </div>
        </MyUserContext.Provider>
    );
}


export default Home;