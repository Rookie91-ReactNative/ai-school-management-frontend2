import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldX className="w-12 h-12 text-red-600" />
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('unauthorized.title')}
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-8">
                    {t('unauthorized.description')}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('unauthorized.goBack')}
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        {t('unauthorized.goToDashboard')}
                    </button>
                </div>

                {/* Contact Info */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                        {t('unauthorized.needAccess')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;