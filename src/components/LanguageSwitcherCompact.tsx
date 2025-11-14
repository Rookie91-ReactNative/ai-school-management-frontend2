import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcherCompact = () => {
    const { i18n } = useTranslation();

    const languages = [
        { code: 'en', name: 'EN', flag: '🇬🇧' },
        { code: 'zh', name: '中', flag: '🇨🇳' },
        { code: 'ms', name: 'MS', flag: '🇲🇾' }
    ];

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-600" />
            <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSwitcherCompact;