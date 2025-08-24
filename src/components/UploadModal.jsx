import Modal from './Modal';
import FileUpload from './FileUpload';
import DocumentList from './DocumentList';

const UploadModal = ({ isOpen, onClose }) => {

  const handleUploadSuccess = (result) => {
    console.log(result)
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="large">
      <div className="flex flex-col h-full max-h-[90vh]">
       

        <div className="flex-1 overflow-y-auto">
          <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onClose={handleClose}
            />
        </div>
      </div>
    </Modal>
  );
};

export default UploadModal;
