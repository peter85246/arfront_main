import React from 'react';
import ReactDOM from 'react-dom/client';
import i18n from './i18n';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import PrivateRoute from './utils/PrivateRoute'; //Private Route
import Login from './pages/Login';
import Home from './pages/Home';
import Machine from './pages/Machine';
import UserManage from './pages/UserManage';
import MachineAlarm from './pages/MachineAlarm';
import SOP from './pages/SOP';
import SOP2 from './pages/SOP2';
import MachineIOTList from './pages/MachineIOTList';
import MachineIOT from './pages/MachineIOT';
import Knowledge from './pages/Knowledge';
import Database from './pages/Database';
import Alarm from './pages/Alarm';
import PageMindMap from './pages/PageMindMap';
import GPT from './pages/GPT';
import VendorsAccount from './components/VendorsAccount'; // 確保路徑正確

import './App.css';
import './index.css';
import { RepairDocument } from './components/RepairDocument';
import { DocumentEditor } from './components/DocumentEditor';
import MachineKnowledge from './pages/MachineKnowledge';
import Assistant from './components/Assistant';
import MenuTest from './components/MenuTest';
import PDFDemo from './pages/PDFDemo';
import { useDatabase } from './components/useDatabse';
import { Preview } from './components/Preview';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      {/* <Route path="/" element={<Login />} />
      <Route path="/vendorsAccount" element={<VendorsAccount />} />  */}
      // 新增的路由，指向 App 組件
      <Route path="/" element={<VendorsAccount />} /> // 將根路徑設定為
      VendorsAccount 頁面
      <Route path="/login" element={<Login />} /> // 添加新路徑 "/login"
      用於登錄頁面
      {/* <Route element={<PrivateRoute />}> */}
      <Route
        path="/pdfDemo"
        element={
          <PrivateRoute>
            <Home>
              <PDFDemo />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/menuTest"
        element={
          <PrivateRoute>
            <Home>
              <MenuTest />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/machine"
        element={
          <PrivateRoute>
            <Home>
              <Machine />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/machineKnowledge"
        element={
          <PrivateRoute>
            <Home>
              <MachineKnowledge />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/machine/:machineId/machineAlarm"
        element={
          <PrivateRoute>
            <Home>
              <MachineAlarm />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/machine/:machineId/machineAlarm/:machineAlarmId/SOP"
        element={
          <PrivateRoute>
            <Home>
              <SOP />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/machine/:machineId/machineIOTList"
        element={
          <PrivateRoute>
            <Home>
              <MachineIOTList />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/machine/:machineId/machineIOTList/:machineIOTId"
        element={
          <PrivateRoute>
            <Home>
              <MachineIOT />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/userManage"
        element={
          <PrivateRoute>
            <Home>
              <UserManage />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/knowledge"
        element={
          <PrivateRoute>
            <Home>
              <Knowledge />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/sop2"
        element={
          <PrivateRoute>
            <Home>
              <SOP2 />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/database"
        element={
          <PrivateRoute>
            <Home>
              <Database />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/repairDocument"
        element={
          <PrivateRoute>
            <Home>
              <RepairDocument />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/preview"
        element={
          <PrivateRoute>
            <Home>
              <Preview />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/document-editor"
        element={
          <PrivateRoute>
            <Home>
              <DocumentEditor />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/alarm"
        element={
          <PrivateRoute>
            <Home>
              <Alarm />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/gpt"
        element={
          <PrivateRoute>
            <Home>
              <GPT />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/pageMindMap"
        element={
          <PrivateRoute>
            <Home>
              <PageMindMap />
            </Home>
          </PrivateRoute>
        }
      />
      <Route
        path="/repairDocument"
        element={
          <PrivateRoute>
            <Home>
              <RepairDocument />
            </Home>
          </PrivateRoute>
        }
      />
      {/* </Route> */}
    </Routes>
    <Assistant />
  </Router>
);
