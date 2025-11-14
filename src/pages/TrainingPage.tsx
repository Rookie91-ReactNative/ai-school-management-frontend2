import { useState } from 'react';
import { Brain, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface TrainingResult {
    totalImages: number;
    successfulImages: number;
    totalStudents: number;
    errors?: string[];
}

const TrainingPage = () => {
    const { t } = useTranslation();
    const [isTraining, setIsTraining] = useState(false);
    const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
    const [error, setError] = useState('');

    const handleTrain = async () => {
        setIsTraining(true);
        setError('');
        setTrainingResult(null);

        try {
            const response = await api.post('/training/train');
            setTrainingResult(response.data.data);
        } catch (err) {
            console.error('Training error:', err);
            setError(t('training.trainingFailed'));
        } finally {
            setIsTraining(false);
        }
    };

    const handleTestModel = async () => {
        alert(t('training.testComingSoon'));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Brain className="w-8 h-8 text-purple-600" />
                    {t('training.title')}
                </h1>
                <p className="text-gray-600 mt-1">{t('training.subtitle')}</p>
            </div>

            {/* Instructions Card */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('training.howItWorksTitle')}</h2>
                <div className="space-y-3 text-gray-700">
                    <p>
                        <span className="font-semibold">{t('training.step1Title')}</span> {t('training.step1Description')}
                    </p>
                    <p>
                        <span className="font-semibold">{t('training.step2Title')}</span> {t('training.step2Description')}
                    </p>
                    <p>
                        <span className="font-semibold">{t('training.step3Title')}</span> {t('training.step3Description')}
                    </p>
                </div>
            </div>

            {/* Training Card */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('training.trainModelTitle')}</h2>

                {/* Status Messages */}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {trainingResult && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="font-semibold text-green-900">{t('training.trainingSuccess')}</p>
                        </div>
                        <div className="text-sm text-green-800 space-y-1">
                            <p>✓ {t('training.totalImagesProcessed')}: {trainingResult.totalImages}</p>
                            <p>✓ {t('training.successfullyTrained')}: {trainingResult.successfulImages}</p>
                            <p>✓ {t('training.studentsRecognized')}: {trainingResult.totalStudents}</p>
                        </div>
                        {trainingResult.errors && trainingResult.errors.length > 0 && (
                            <div className="mt-3 text-sm text-yellow-800">
                                <p className="font-semibold">{t('training.warnings')}</p>
                                {trainingResult.errors.slice(0, 5).map((err: string, idx: number) => (
                                    <p key={idx}>• {err}</p>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Training Button */}
                <button
                    onClick={handleTrain}
                    disabled={isTraining}
                    className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3"
                >
                    {isTraining ? (
                        <>
                            <Loader className="w-6 h-6 animate-spin" />
                            {t('training.trainingInProgress')}
                        </>
                    ) : (
                        <>
                            <Brain className="w-6 h-6" />
                            {t('training.startTraining')}
                        </>
                    )}
                </button>

                {isTraining && (
                    <p className="text-center text-sm text-gray-600 mt-4">
                        {t('training.trainingTimeNotice')}
                    </p>
                )}
            </div>

            {/* Model Status Card */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('training.modelStatusTitle')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">{t('training.modelStatus')}</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                            {trainingResult ? t('training.trained') : t('training.notTrained')}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">{t('training.students')}</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                            {trainingResult?.totalStudents || 0}
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">{t('training.trainingImages')}</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                            {trainingResult?.successfulImages || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Test Model Card */}
            {trainingResult && (
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('training.testRecognitionTitle')}</h2>
                    <p className="text-gray-600 mb-4">
                        {t('training.testRecognitionDescription')}
                    </p>
                    <button
                        onClick={handleTestModel}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Brain className="w-5 h-5" />
                        {t('training.testModel')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default TrainingPage;