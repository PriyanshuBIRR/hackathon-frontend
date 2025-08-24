import { useState } from 'react';
import { Link } from 'react-router-dom';
import UploadModal from '../components/UploadModal';
import DocumentList from '../components/DocumentList';

const SettingsPage = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800  dark:border-gray-700 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-sm font-medium">Back to Home</span>
                        </Link>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your preferences and application settings</p>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm bg-opacity-10 m-8">
                <div className=' flex flex-row justify-between'>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Document Management</h2>

                <div className="space-y-4">
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                        >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Documents
                    </button>
                </div>
                        </div>
                        <DocumentList />
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
            

        </div>
    );
};

export default SettingsPage;
