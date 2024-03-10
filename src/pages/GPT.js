import { useEffect } from 'react';
import styles from '../scss/gpt.module.scss';

export default function GPT() {

  useEffect(() => {
    (function(d, t) {
      var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
      v.onload = function() {
        window.voiceflow.chat.load({
          verify: { projectID: '657966c09e57db431ad839e8' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production'
        });
      }
      v.src = "https://cdn.voiceflow.com/widget/bundle.mjs"; v.type = "text/javascript"; s.parentNode.insertBefore(v, s);
    })(document, 'script');
  }, []);

  return (
    <main>
      <h2>GPT</h2>
      <div className={styles["content2"]}>
        <div className={styles["button-function"]}></div>
        <div className={styles["content-wrapper-gpt"]}>
          <div className={styles["container-gpt"]}>
            <div className={styles["chat-area"]}>
              <textarea
                id="chat-input"
                className={styles["chat-input"]}
                placeholder="請輸入資訊"
              >
                請介紹貴公司??
              </textarea>
              <select
                aria-label="option-gate"
                id="prompt-select"
                className={styles["prompt-select"]}
              >
                <option value="prompt-general">[@PROMPT]一般指令</option>
                <option value="prompt-general">[@PROMPT]一般指令2</option>
                {/* <!-- 在這裡添加更多的選項 --> */}
              </select>
              <div className={styles["chat-controls"]}>
                <button id="send">送出</button>
                <button id="cancel">中止</button>
                <button id="new-chat">new chat</button>
                <button id="clear">Clear</button>
              </div>
            </div>
            <div className={styles["gpt-response-area"]}>
              <div className={styles["user-question"]}>
                <p>請介紹貴公司??</p>
              </div>
              <div className={styles["gpt-response"]}>
                <p className={styles["gptLabel"]}>德川GPT回答：</p>
                <br />
                <p className={styles["gptContent"]}>
                  公司介紹影片[https://www.youtube.com/watch?v=GzUDqPUih5A]{" "}
                  <br />
                  德川公司是一間專業的數控旋轉工作台製造廠，本著誠信、務實、專精及恆心的理念，不斷的研究與創新，並有嚴格之品質管制機制，以確保出廠的產品都有著高水準的品質。德川擁有多位工具機械機床設計的人員，整合分度盤與機床的搭配，讓德川的每個工作台都能發揮最大的實質效能，為世界各國各大工具機製造商所信賴。除此之外，您可以點選【德川網站
                  https://www.detron-rotary.com/tw/index.html】來查閱其他德川相關的資訊。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
