const ImageUploadBox = ({
  step,
  dataId,
  inputName,
  uploadButtonId,
  deleteButtonId,
}) => {
  return (
    <div ref={(ref) => (this.uploadRef = ref)}>
      <div
        className={styles['image-box']}
        data-step={step}
        data-id={dataId}
        style={{
          border: '1px solid #ccc',
          minHeight: '150px',
          backgroundColor: '#fff',
        }}
      >
        <img
          src=""
          className={styles['uploaded-image']}
          alt="Uploaded Images"
          style={{ display: 'none' }}
          id={`${dataId}Image`}
        />
      </div>
      <div className={styles['image-actions']}>
        <input
          type="file"
          name={inputName}
          id={`${dataId}-image-input`}
          className={styles['image-input']}
          hidden
          data-id={dataId}
        />
        <button className={styles['upload-btn-model']} id={uploadButtonId}>
          上傳圖片
        </button>
        <button className={styles['delete-btn-model']} id={deleteButtonId}>
          刪除圖片
        </button>
      </div>
    </div>
  );
};

export default ImageUploadBox;
