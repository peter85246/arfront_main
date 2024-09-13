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
  const [displaySeries, setDisplaySeries] = useState('');

  // const [machineName, setMachineName] = useState('');

  useEffect(() => {
    console.log(
      'Received MachineAddId:',
      machineAddId,
      'Model Series:',
      modelSeries
    ); // 檢查是否正確接收
  }, [machineAddId, modelSeries, machineName]);

  useEffect(() => {
    console.log(
      'Received MachineAddId:',
      machineAddId,
      'Model Series:',
      modelSeries
    );
  }, [machineAddId, modelSeries]);

  useEffect(() => {
    console.log('Received MachineAddId:', machineAddId);
    console.log('Original Model Series:', modelSeries);

    if (modelSeries) {
      let series = modelSeries;
      console.log('Initial series:', series);

      // 移除可能的 "車床" 後綴，但保留其他所有字符
      series = series.replace(/車床$/, '').trim();

      // 添加 "系列" 後綴
      const finalSeries = `${series}系列`;
      console.log('Final display series:', finalSeries);
      setDisplaySeries(finalSeries);
    } else {
      console.log('Model Series is undefined or null');
      setDisplaySeries(t('pageMindMap.content.header')); // 使用默認值
    }
  }, [machineAddId, modelSeries, t]);

  useEffect(() => {
    console.log('Display Series has been set to:', displaySeries);
  }, [displaySeries]);

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
                    {/* {modelSeries ? `${modelSeries}系列` : t('pageMindMap.content.header')} */}
                    {displaySeries || t('pageMindMap.content.header')}
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
