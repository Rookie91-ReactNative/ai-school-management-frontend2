import { useState, useEffect } from 'react';
import { Settings, Save, Clock, Video, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { authService } from '../services/authService';

interface SystemSetting {
    schoolID: number;
    settingKey: string;
    settingValue: string;
    description: string;
}

const SettingsPage = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<{ [key: string]: string }>({
        RecognitionThreshold: '0.65',
        SchoolStartTime: '07:30',
        SchoolEndTime: '15:30',
        LateThreshold: '15',
        ProcessFrameInterval: '3',
        EnableParentNotification: '1',
        AbsentNotificationTime: '08:30'
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser?.schoolID) {
                console.error('No school ID found');
                return;
            }

            const response = await api.get(`/settings/school/${currentUser.schoolID}`);
            const settingsData = response.data.data;

            // Convert array of settings to object
            const settingsObj: { [key: string]: string } = {};
            settingsData.forEach((setting: SystemSetting) => {
                settingsObj[setting.settingKey] = setting.settingValue;
            });

            setSettings(settingsObj);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setSettings({
            ...settings,
            [key]: value
        });
        setSaveMessage(''); // Clear message when user makes changes
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');

        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser?.schoolID) {
                setSaveMessage(t('settings.errorNoSchool'));
                return;
            }

            // Convert settings object to array format for API
            const settingsArray = Object.entries(settings).map(([key, value]) => ({
                settingKey: key,
                settingValue: value
            }));

            await api.put(`/settings/school/${currentUser.schoolID}`, {
                settings: settingsArray
            });

            setSaveMessage(t('settings.successMessage'));
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setSaveMessage(t('settings.errorMessage'));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-600" />
                        {t('settings.title')}
                    </h1>
                    <p className="text-gray-600 mt-1">{t('settings.subtitle')}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-2"
                >
                    <Save className="w-5 h-5" />
                    {isSaving ? t('settings.saving') : t('settings.saveChanges')}
                </button>
            </div>

            {/* Save Message */}
            {saveMessage && (
                <div className={`p-4 rounded-lg ${saveMessage.includes('Error') || saveMessage.includes('错误') || saveMessage.includes('Ralat')
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-green-50 border border-green-200 text-green-800'
                    }`}>
                    {saveMessage}
                </div>
            )}

            {/* Settings Sections */}
            <div className="space-y-6">
                {/* Face Recognition Settings */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Video className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{t('settings.faceRecognitionTitle')}</h2>
                            <p className="text-sm text-gray-600">{t('settings.faceRecognitionSubtitle')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Recognition Threshold */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('settings.recognitionThreshold')}
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0.5"
                                    max="0.95"
                                    step="0.05"
                                    value={settings.RecognitionThreshold}
                                    onChange={(e) => handleChange('RecognitionThreshold', e.target.value)}
                                    className="flex-1"
                                />
                                <span className="text-lg font-semibold text-gray-900 min-w-[60px] text-right">
                                    {(parseFloat(settings.RecognitionThreshold) * 100).toFixed(0)}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {t('settings.recognitionThresholdHint')}
                            </p>
                        </div>

                        {/* Process Frame Interval */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('settings.processFrameInterval')}
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={settings.ProcessFrameInterval}
                                    onChange={(e) => handleChange('ProcessFrameInterval', e.target.value)}
                                    className="input-field w-24"
                                />
                                <span className="text-sm text-gray-600">{t('settings.processFrameIntervalUnit')}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {t('settings.processFrameIntervalHint')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* School Hours */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{t('settings.schoolHoursTitle')}</h2>
                            <p className="text-sm text-gray-600">{t('settings.schoolHoursSubtitle')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Start Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('settings.schoolStartTime')}
                            </label>
                            <input
                                type="time"
                                value={settings.SchoolStartTime}
                                onChange={(e) => handleChange('SchoolStartTime', e.target.value)}
                                className="input-field"
                            />
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('settings.schoolEndTime')}
                            </label>
                            <input
                                type="time"
                                value={settings.SchoolEndTime}
                                onChange={(e) => handleChange('SchoolEndTime', e.target.value)}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {/* Attendance Rules */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{t('settings.attendanceRulesTitle')}</h2>
                            <p className="text-sm text-gray-600">{t('settings.attendanceRulesSubtitle')}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('settings.lateThreshold')}
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="5"
                                max="60"
                                value={settings.LateThreshold}
                                onChange={(e) => handleChange('LateThreshold', e.target.value)}
                                className="input-field w-32"
                            />
                            <span className="text-sm text-gray-600">
                                {t('settings.lateThresholdUnit')}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {t('settings.lateThresholdHint')}
                        </p>
                    </div>
                </div>

                {/* Notifications - Commented out in original */}
                {/*<div className="card">*/}
                {/*    <div className="flex items-center gap-3 mb-4">*/}
                {/*        <div className="p-2 bg-green-100 rounded-lg">*/}
                {/*            <Bell className="w-6 h-6 text-green-600" />*/}
                {/*        </div>*/}
                {/*        <div>*/}
                {/*            <h2 className="text-xl font-semibold text-gray-900">{t('settings.notificationsTitle')}</h2>*/}
                {/*            <p className="text-sm text-gray-600">{t('settings.notificationsSubtitle')}</p>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                {/*    <div className="space-y-4">*/}
                {/*        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">*/}
                {/*            <div>*/}
                {/*                <h3 className="font-medium text-gray-900">{t('settings.enableParentNotifications')}</h3>*/}
                {/*                <p className="text-sm text-gray-600">{t('settings.enableParentNotificationsDesc')}</p>*/}
                {/*            </div>*/}
                {/*            <label className="relative inline-flex items-center cursor-pointer">*/}
                {/*                <input*/}
                {/*                    type="checkbox"*/}
                {/*                    checked={settings.EnableParentNotification === '1'}*/}
                {/*                    onChange={(e) => handleChange('EnableParentNotification', e.target.checked ? '1' : '0')}*/}
                {/*                    className="sr-only peer"*/}
                {/*                />*/}
                {/*                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>*/}
                {/*            </label>*/}
                {/*        </div>*/}

                {/*        {settings.EnableParentNotification === '1' && (*/}
                {/*            <div>*/}
                {/*                <label className="block text-sm font-medium text-gray-700 mb-2">*/}
                {/*                    {t('settings.absentNotificationTime')}*/}
                {/*                </label>*/}
                {/*                <input*/}
                {/*                    type="time"*/}
                {/*                    value={settings.AbsentNotificationTime}*/}
                {/*                    onChange={(e) => handleChange('AbsentNotificationTime', e.target.value)}*/}
                {/*                    className="input-field w-48"*/}
                {/*                />*/}
                {/*                <p className="text-xs text-gray-500 mt-1">*/}
                {/*                    {t('settings.absentNotificationTimeHint')}*/}
                {/*                </p>*/}
                {/*            </div>*/}
                {/*        )}*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        </div>
    );
};

export default SettingsPage;