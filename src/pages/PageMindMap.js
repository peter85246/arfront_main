import { React, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; //語系
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import styles from '../scss/global.module.scss';
import stylesAlarm from '../scss/Alarm.module.scss';
import MindMap from '../components/MindMap';
import MenuTest from '../components/MenuTest';
import { Link } from 'react-router-dom';

export default function PageMindMap() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
  const { machineAddId, modelSeries, machineName } = location.state || {};

  // const [machineName, setMachineName] = useState('');

  useEffect(() => {
    console.log(
      'Received MachineAddId:',
      machineAddId,
      'Model Series:',
      modelSeries
    ); // 檢查是否正確接收
  }, [machineAddId, modelSeries, machineName]);

  // 設定 onSelect 函數以更新機器名稱
  // const handleSelect = (selectedKeys, info) => {
  //   if (info.node && info.node.title && !info.node.children) {
  //     setMachineName(info.node.title.split('-')[1]); // 假設格式為 'CNC車床-CNC-CNC-77888'，並取第二階層 'CNC'
  //   }
  // };

  return (
    <div className={stylesAlarm.content}>
      {/* <div className={stylesAlarm.buttonsContainerMindMap}>
        <Link
          to="/alarm"
          className={classNames(styles.button, stylesAlarm.btnCancelMindMap)}
        >
          刪除
        </Link>
        <Link
          to="/document-editor"
          className={classNames(styles.button, stylesAlarm.btnEditMindMap)}
        >
          編輯
        </Link>
      </div> */}
      <div className={styles.backPage}>
        <Link to="/alarm" className={'fas fa-angle-left'}>
          {' '}
          故障庫
        </Link>
      </div>
      <main>
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2 justify-content-between">
              <div />
              <div className="content-header-text-color">
                <h1>
                  <strong>
                    {modelSeries ? `${modelSeries}` : ''}
                    {t('pageMindMap.content.header')}
                    {/*系列*/}
                  </strong>
                </h1>
              </div>
              <div></div>
            </div>
          </div>
        </section>

        <div className={stylesAlarm.contentBoxAlarm}>
          <div className={stylesAlarm.contentBoxMindMap}>
            <div className={styles['mindmap']}>
              {machineAddId && (
                <MenuTest
                  machineAddId={machineAddId}
                  machineName={machineName}
                  // defaultZoom={0.7}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
