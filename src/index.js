import React from 'react';
import ReactDOM from 'react-dom/client';
import i18n from './i18n';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import PrivateRoute from './utils/PrivateRoute'; //Private Route
import './index.css';
import Login from './pages/Login';
import Home from './pages/Home';
import Machine from './pages/Machine';
import UserManage from './pages/UserManage';
import MachineAlarm from './pages/MachineAlarm';
import SOP from './pages/SOP';
import MachineIOTList from './pages/MachineIOTList';
import MachineIOT from './pages/MachineIOT';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Router>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<PrivateRoute />}>
                <Route path="/machine"
                    element={
                        <Home>
                            <Machine />
                        </Home>
                    } />
                <Route path="/machine/:machineId/machineAlarm"
                    element={
                        <Home>
                            <MachineAlarm />
                        </Home>
                    } />
                <Route path="/machine/:machineId/machineAlarm/:machineAlarmId/SOP"
                    element={
                        <Home>
                            <SOP />
                        </Home>
                    } />
                <Route path="/machine/:machineId/machineIOTList"
                    element={
                        <Home>
                            <MachineIOTList />
                        </Home>
                    } />
                <Route path="/machine/:machineId/machineIOTList/:machineIOTId"
                    element={
                        <Home>
                            <MachineIOT />
                        </Home>
                    } />
                <Route path="/userManage"
                    element={
                        <Home>
                            <UserManage />
                        </Home>
                    } />
            </Route>
        </Routes>
    </Router>
);
