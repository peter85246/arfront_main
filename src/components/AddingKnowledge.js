import classNames from 'classnames';
import styles from '../scss/AddingKnowledge.module.scss';

export function AddingKnowledge({ onClose }) {

  return (
    // <!-- 新增知識的模态框 -->
    // <!-- Modal with overlay -->
    <div className={styles.modalOverlay} id="modalOverlayMachine">
      <div className={styles.modal} id="myModalMachine">
          <div className={styles.modalTitleMachine}>新增機台</div>
          <span id="closeModalBtnMachine" className={styles.closeModalBtn} onClick={onClose}>&times;</span>
          <hr className={styles.titleLine2} />
          <div className={styles.inputField}>
              <label for="account">帳號</label>
              <input placeholder="#" type="text" className={styles.inputAccount} value="XXXXX" readonly />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.redStar} for="invoice-number">機台種類</label>
            <div className={classNames(styles.customSelect, styles.equipmentField)}>
              <input className={styles.machineInfo} name="invoice-number" id="machineType" placeholder="請輸入資訊" />
              <span className={styles.dropDownArrow}>▼</span>
              <ul className={styles.customDatalist} id="invoice-options">
                <li data-value="選項1">選項1</li>
                <li data-value="選項2">選項2</li>
                <li data-value="選項3">選項3</li>
              </ul>
            </div>
          </div>

          <div className={styles.inputField}></div>
          
          <div className={styles.formGroup}>
            <label className={styles.redStar} for="invoice-number">型號系列</label>
            <div className={classNames(styles.customSelect, styles.equipmentField)}>
              <input className={styles.machineInfo} name="invoice-number" id="modelSeries" placeholder="請輸入資訊" />
              <span className={styles.dropDownArrow}>▼</span>
              <ul className={styles.customDatalist} id="invoice-options">
                <li data-value="選項1">選項1</li>
                <li data-value="選項2">選項2</li>
                <li data-value="選項3">選項3</li>
              </ul>
            </div>
          </div>

          <div className={styles.inputField}>
              <label className={styles.redStar}>機台型號</label>
              <input type="text" placeholder="請輸入名稱資訊" className={styles.machineInfo} id="machineModel" required />
          </div>
          
          <div className={styles.buttonsMachine}>
            <a href="firstPage.html" className={classNames(styles.button, styles.btnCancel)}>取消</a>
            <a href="#" className={classNames(styles.button, styles.btnSave)} id="openModalBtn-machine" type="button">儲存</a>
          </div> 
      </div>
    </div>
  );
}