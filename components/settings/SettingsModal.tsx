import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../shared/LanguageContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
    theme: any;
    is24Hour: boolean;
    setIs24Hour: (val: boolean) => void;
    animationStyle: 'morph' | 'liquid';
    setAnimationStyle: (val: 'morph' | 'liquid') => void;
    standbyBg: 'metaballs' | 'distortion' | 'none';
    setStandbyBg: (val: 'metaballs' | 'distortion' | 'none') => void;
}

export const SettingsModal: React.FC<Props> = ({
    isOpen, onClose, isDark, theme, is24Hour, setIs24Hour, animationStyle, setAnimationStyle, standbyBg, setStandbyBg
}) => {
    const { t, language, setLanguage } = useLanguage();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full max-w-xs sm:max-w-sm p-6 sm:p-7 rounded-[2rem] shadow-2xl ${isDark ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-black/5'} flex flex-col gap-6`}
                    >
                        <div className="flex justify-between items-center">
                            <h3 className={`font-semibold text-lg tracking-tight ${theme.text}`}>{t('settings')}</h3>
                            <button onClick={onClose}
                                className={`p-1.5 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition active:scale-95`}
                                aria-label={t('closeSettings')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Time Format */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className={`text-sm font-semibold ${theme.text}`}>{t('timeFormat')}</span>
                                    <span className={`text-xs ${theme.textMuted} opacity-70`}>{t('timeFormatDesc')}</span>
                                </div>
                                <div className={`flex shadow-sm border rounded-full p-1 gap-1 ${theme.toggleBg}`}>
                                    <div onClick={() => setIs24Hour(false)}
                                        className={`px-3 py-1.5 rounded-full transition cursor-pointer font-semibold text-xs sm:text-sm ${!is24Hour ? `${theme.toggleActive} shadow-md` : theme.toggleInactive}`}>
                                        12h
                                    </div>
                                    <div onClick={() => setIs24Hour(true)}
                                        className={`px-3 py-1.5 rounded-full transition cursor-pointer font-semibold text-xs sm:text-sm ${is24Hour ? `${theme.toggleActive} shadow-md` : theme.toggleInactive}`}>
                                        24h
                                    </div>
                                </div>
                            </div>

                            {/* Animation Style */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className={`text-sm font-semibold ${theme.text}`}>{t('animations')}</span>
                                    <span className={`text-xs ${theme.textMuted} opacity-70`}>{t('animationsDesc')}</span>
                                </div>
                                <div className={`flex shadow-sm border rounded-full p-1 gap-1 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold ${theme.toggleBg}`}>
                                    <div onClick={() => setAnimationStyle('morph')}
                                        className={`px-2.5 sm:px-3 py-1.5 rounded-full transition cursor-pointer ${animationStyle === 'morph' ? `${theme.toggleActive} shadow-md` : theme.toggleInactive}`}>
                                        {t('morph')}
                                    </div>
                                    <div onClick={() => setAnimationStyle('liquid')}
                                        className={`px-2.5 sm:px-3 py-1.5 rounded-full transition cursor-pointer ${animationStyle === 'liquid' ? `${theme.toggleActive} shadow-md` : theme.toggleInactive}`}>
                                        {t('liquid')}
                                    </div>
                                </div>
                            </div>

                            {/* Standby Background */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className={`text-sm font-semibold ${theme.text}`}>{t('standbyBg')}</span>
                                    <span className={`text-xs ${theme.textMuted} opacity-70`}>{t('standbyBgDesc')}</span>
                                </div>
                                <div className={`flex shadow-sm border rounded-full p-1 gap-1 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold ${theme.toggleBg}`}>
                                    <div onClick={() => setStandbyBg('metaballs')}
                                        className={`px-2 py-1.5 rounded-full transition cursor-pointer ${standbyBg === 'metaballs' ? `${theme.toggleActive} shadow-md` : theme.toggleInactive}`}>
                                        {t('metaballs')}
                                    </div>
                                    <div onClick={() => setStandbyBg('distortion')}
                                        className={`px-2 py-1.5 rounded-full transition cursor-pointer ${standbyBg === 'distortion' ? `${theme.toggleActive} shadow-md` : theme.toggleInactive}`}>
                                        {t('distortion')}
                                    </div>
                                    <div onClick={() => setStandbyBg('none')}
                                        className={`px-2 py-1.5 rounded-full transition cursor-pointer ${standbyBg === 'none' ? `${theme.toggleActive} shadow-md` : theme.toggleInactive}`}>
                                        {t('none')}
                                    </div>
                                </div>
                            </div>

                            {/* Language */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className={`text-sm font-semibold ${theme.text}`}>{t('language')}</span>
                                    <span className={`text-xs ${theme.textMuted} opacity-70`}>Choose your language</span>
                                </div>
                                <div className={`flex shadow-sm border rounded-full p-1 gap-1 ${theme.toggleBg}`}>
                                    <div onClick={() => setLanguage('en')}
                                        className={`px-3 py-1.5 rounded-full transition cursor-pointer font-semibold text-xs sm:text-sm ${language === 'en' ? `${theme.toggleActive} shadow-md` : theme.toggleInactive}`}>
                                        EN
                                    </div>
                                    <div onClick={() => setLanguage('id')}
                                        className={`px-3 py-1.5 rounded-full transition cursor-pointer font-semibold text-xs sm:text-sm ${language === 'id' ? `${theme.toggleActive} shadow-md` : theme.toggleInactive}`}>
                                        ID
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
