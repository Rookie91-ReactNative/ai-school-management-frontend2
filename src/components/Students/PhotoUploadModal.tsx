import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { studentService } from '../../services/studentService';

interface PhotoUploadModalProps {
    studentCode: string;
    studentName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PhotoUploadModal = ({ studentCode, studentName, isOpen, onClose, onSuccess }: PhotoUploadModalProps) => {
    const { t } = useTranslation();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        Array.from(files).forEach((file) => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessage(t('students.messages.errorFileSizeTooBig'));
                return;
            }

            validFiles.push(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === validFiles.length) {
                    setPreviews([...previews, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setSelectedFiles([...selectedFiles, ...validFiles]);
        setErrorMessage('');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const removeFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setErrorMessage(t('students.messages.errorAtLeastOnePhoto'));
            return;
        }

        setIsUploading(true);
        setUploadStatus('idle');
        setErrorMessage('');

        try {
            // Create FileList-like object
            const dataTransfer = new DataTransfer();
            selectedFiles.forEach(file => dataTransfer.items.add(file));

            await studentService.uploadPhotos(studentCode, dataTransfer.files);

            setUploadStatus('success');
            setTimeout(() => {
                onSuccess();
                handleClose();
            }, 1500);
        } catch (err: unknown) {
            console.error('Upload error:', err);
            setUploadStatus('error');
            const message = err instanceof Error ? err.message : t('students.messages.errorUploading');
            setErrorMessage(message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFiles([]);
        setPreviews([]);
        setUploadStatus('idle');
        setErrorMessage('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Camera className="w-6 h-6 text-blue-600" />
                            {t('students.actions.uploadPhotos')}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {studentName} ({studentCode})
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Guidelines */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">{t('students.uploadPhotoModal.photoGuidelines')}</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• {t('students.uploadPhotoModal.photoGuideline1')}</li>
                            <li>• {t('students.uploadPhotoModal.photoGuideline2')}</li>
                            <li>• {t('students.uploadPhotoModal.photoGuideline3')}</li>
                            <li>• {t('students.uploadPhotoModal.photoGuideline4')}</li>
                            <li>• {t('students.uploadPhotoModal.photoGuideline5')}</li>
                        </ul>
                    </div>

                    {/* Upload Area */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                            <span className="font-semibold text-blue-600">{t('students.uploadPhotoModal.clickToUpload')}</span>{t('students.uploadPhotoModal.orDragandDrop')}
                        </p>
                        <p className="text-sm text-gray-500">{t('students.uploadPhotoModal.formatAndSize')}</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e.target.files)}
                            className="hidden"
                        />
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-sm text-red-800">{errorMessage}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {uploadStatus === 'success' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="text-sm text-green-800">{t('students.messages.successUploaded')}</p>
                        </div>
                    )}

                    {/* Preview Grid */}
                    {previews.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">
                                Selected Photos ({selectedFiles.length})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(index);
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                            {(selectedFiles[index].size / 1024).toFixed(0)} KB
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        {selectedFiles.length} {selectedFiles.length === 1 ? t('students.uploadPhotoModal.photo') : t('students.uploadPhotoModal.photos')} {t('students.uploadPhotoModal.selected')}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            disabled={isUploading}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {t('students.uploadPhotoModal.cancel')}
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || selectedFiles.length === 0}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <>{t('students.uploadPhotoModal.uploading')}</>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                        <>{t('students.uploadPhotoModal.save')}</>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoUploadModal;