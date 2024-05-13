import styles from "../../scss/gpt.module.scss";
import { Space, ColorPicker, theme, Flex, Input } from "antd";
const { TextArea } = Input;
const onChange = (e) => {
  console.log(e);
};

const TextAreaContainer = ({ label, id, name, placeholder, textColor, setTextColor, onChange }) => {
    return (
      <div className={styles["text-area-container"]}>
        <label className={styles["red-star"]} htmlFor={id}>
          {label}
        </label>
        <TextArea
          name={name}
          id={id}
          placeholder={placeholder}
          allowClear={true}
          onChange={onChange}
          style={{ color: textColor, height: "150px" }}
        />
        <div className={styles["color-picker-container"]}>
          <Space direction="vertical">
            <ColorPicker
              defaultValue={textColor}
              size="small"
              onChange={(color) => setTextColor(color.hex)}
            />
          </Space>
        </div>
      </div>
    );
  };

  export default TextAreaContainer;
