import classNames from 'classnames';
import styles from '../scss/ConditionSearchDialog.module.scss'

export function ConditionSearchDialog({ onClose }) {
  return (
    <div className={styles.modalOverlay} id="modalOverlay">
      <div className={styles.modalCondition} id="myModal">
        <div className={styles.modalTitleCondition}>條件查詢</div>
        <span id="closeModalBtn" className={styles.closeModalBtn} onClick={onClose}>
          &times;
        </span>
        <hr className={styles.titleLine2} />
        <div className={styles.leftBoxCondition}>
          <p>可拖動選項至目標欄位填入項目</p>
          <div className={styles.boxCondition1}>
            <input
              type="text"
              id="search"
              className={styles.search}
              placeholder="搜尋全部內容項目"
              autocomplete="off"
            />

            <div className={styles.scrollBox}>
              <div className={styles.conditionItem} draggable="true">
                <span>項目1</span>
                <div className={styles.icon}>≡</div>
              </div>
              <div className={styles.conditionItem} draggable="true">
                <span>項目2</span>
                <div className={styles.icon}>≡</div>
              </div>
              <div className={styles.conditionItem} draggable="true">
                <span>項目3</span>
                <div className={styles.icon}>≡</div>
              </div>
              <div className={styles.conditionItem} draggable="true">
                <span>項目4</span>
                <div className={styles.icon}>≡</div>
              </div>
              <div className={styles.conditionItem} draggable="true">
                <span>項目5</span>
                <div className={styles.icon}>≡</div>
              </div>
              <div className={styles.conditionItem} draggable="true">
                <span>項目6</span>
                <div className={styles.icon}>≡</div>
              </div>
              <div className={styles.conditionItem} draggable="true">
                <span>項目7</span>
                <div className={styles.icon}>≡</div>
              </div>
              <div className={styles.conditionItem} draggable="true">
                <span>項目8</span>
                <div className={styles.icon}>≡</div>
              </div>
              <div className={styles.conditionItem} draggable="true">
                <span>項目9</span>
                <div className={styles.icon}>≡</div>
              </div>
              <div className={styles.conditionItem} draggable="true">
                <span>項目10</span>
                <div className={styles.icon}>≡</div>
              </div>
              {/* <!-- ... 其他條件項目 ... --> */}
            </div>
          </div>
        </div>

        <div className={styles.rightBoxCondition}>
          <div className={styles.boxCondition2}>
            <div className={styles.formGroupCondition}>
              <label for="invoice-number">設備種類：</label>
              <div className={styles.customSelectCondition}>
                <input
                  className={styles.faultInfo}
                  name="invoice-number"
                  id="invoice-number"
                  placeholder="請輸入資訊"
                />
                <span className={styles.dropDownArrow}>▼</span>
                <ul className={styles.customDatalist} id="invoice-options">
                  <li data-value="選項1">選項1</li>
                  <li data-value="選項2">選項2</li>
                  <li data-value="選項3">選項3</li>
                </ul>
              </div>
            </div>

            <div className={styles.formGroupCondition}>
              <label for="invoice-number">設備部件：</label>
              <div className={styles.customSelectCondition}>
                <input
                  className={styles.faultInfo}
                  name="invoice-number"
                  id="invoice-number"
                  placeholder="請輸入資訊"
                />
                <span className={styles.dropDownArrow}>▼</span>
                <ul className={styles.customDatalist} id="invoice-options">
                  <li data-value="選項1">選項1</li>
                  <li data-value="選項2">選項2</li>
                  <li data-value="選項3">選項3</li>
                </ul>
              </div>
            </div>

            <div className={styles.formGroupCondition}>
              <label for="invoice-number">維修項目：</label>
              <div className={styles.customSelectCondition}>
                <input
                  className={styles.faultInfo}
                  name="invoice-number"
                  id="invoice-number"
                  placeholder="請輸入資訊"
                />
                <span className={styles.dropDownArrow}>▼</span>
                <ul className={styles.customDatalist} id="invoice-options">
                  <li data-value="選項1">選項1</li>
                  <li data-value="選項2">選項2</li>
                  <li data-value="選項3">選項3</li>
                </ul>
              </div>
            </div>

            <div className={styles.formGroupCondition}>
              <label for="invoice-number">維修類型：</label>
              <div className={styles.customSelectCondition}>
                <input
                  className={styles.faultInfo}
                  name="invoice-number"
                  id="invoice-number"
                  placeholder="請輸入資訊"
                />
                <span className={styles.dropDownArrow}>▼</span>
                <ul className={styles.customDatalist} id="invoice-options">
                  <li data-value="選項1">選項1</li>
                  <li data-value="選項2">選項2</li>
                  <li data-value="選項3">選項3</li>
                </ul>
              </div>
            </div>

            <div className={styles.formGroupCondition}>
              <label for="invoice-number">規格：</label>
              <div className={styles.customSelectCondition}>
                <input
                  className={styles.faultInfo}
                  name="invoice-number"
                  id="invoice-number"
                  placeholder="請輸入資訊"
                />
                <span className={styles.dropDownArrow}>▼</span>
                <ul className={styles.customDatalist} id="invoice-options">
                  <li data-value="選項1">選項1</li>
                  <li data-value="選項2">選項2</li>
                  <li data-value="選項3">選項3</li>
                </ul>
              </div>
            </div>

            <div className={styles.formGroupCondition}>
              <label for="invoice-number">系統：</label>
              <div className={styles.customSelectCondition}>
                <input
                  className={styles.faultInfo}
                  name="invoice-number"
                  id="invoice-number"
                  placeholder="請輸入資訊"
                />
                <span className={styles.dropDownArrow}>▼</span>
                <ul className={styles.customDatalist} id="invoice-options">
                  <li data-value="選項1">選項1</li>
                  <li data-value="選項2">選項2</li>
                  <li data-value="選項3">選項3</li>
                </ul>
              </div>
            </div>

            <div className={styles.formGroupCondition}>
              <label for="invoice-number">產品名稱：</label>
              <div className={styles.customSelectCondition}>
                <input
                  className={styles.faultInfo}
                  name="invoice-number"
                  id="invoice-number"
                  placeholder="請輸入資訊"
                />
                <span className={styles.dropDownArrow}>▼</span>
                <ul className={styles.customDatalist} id="invoice-options">
                  <li data-value="選項1">選項1</li>
                  <li data-value="選項2">選項2</li>
                  <li data-value="選項3">選項3</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.buttonsCondition}>
          <a href="/knowledge" className={classNames(styles.button, styles.btnCancel)}>
            取消
          </a>
          <a
            href="./QueryResult.html"
            className={classNames(styles.button, styles.btnSave)}
            id="openModalBtn-condition"
            type="button"
          >
            儲存
          </a>
        </div>

        {/* <!-- 新增知識的模态框 --> */}

        {/* <div className={styles.modalOverlay} id="modalOverlay">
          <div className={styles.modal} id="myModal">
            <div className={styles.modalTitleSOP}>新增知識</div>
            <span id="closeModalBtn" className={styles.closeModalBtn}>
              &times;
            </span>
            <hr className={styles.titleLine2} />
            <div className={styles.inputField} />
            <label for="account">帳號</label>
            <input
              placeholder="#"
              type="text"
              className={classNames(styles.input, styles.account)}
              value="XXXXX"
              readonly
            />
          </div>
          <div className={styles.inputField} />
          <label id="sopNumberLabel">編號：1</label>
        </div> */}
        {/* <div className={styles.inputField} />
        <label className={styles.redStar}>SOP名稱</label>
        <input
          type="text"
          placeholder="請輸入名稱資訊"
          className={classNames(styles.input, styles.SOPName)}
          required
        /> */}
      </div>
      {/* <div className={styles.buttons}>
        <button id="cancelBtn">取消</button>
        <button id="saveBtn">儲存</button>
      </div> */}
    </div>
  );
}
