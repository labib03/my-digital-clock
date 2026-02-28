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
    animationStyle: 'morph' | 'liquid' | 'static';
    setAnimationStyle: (val: 'morph' | 'liquid' | 'static') => void;
    standbyBg: 'metaballs' | 'distortion' | 'css' | 'none';
    setStandbyBg: (val: 'metaballs' | 'distortion' | 'css' | 'none') => void;
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

                        <div className="flex flex-col gap-7">
                            {/* Time Format */}
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className={`text-sm font-bold ${theme.text}`}>{t('timeFormat')}</span>
                                    <span className={`text-[11px] ${theme.textMuted} opacity-60 leading-tight line-clamp-2`}>{t('timeFormatDesc')}</span>
                                </div>
                                <div className={`flex shrink-0 shadow-sm border rounded-xl p-1 gap-1 ${theme.toggleBg}`}>
                                    <div onClick={() => setIs24Hour(false)}
                                        className={`px-4 py-1.5 rounded-[10px] transition cursor-pointer font-bold text-xs ${!is24Hour ? `${theme.toggleActive} shadow-sm` : theme.toggleInactive}`}>
                                        12H
                                    </div>
                                    <div onClick={() => setIs24Hour(true)}
                                        className={`px-4 py-1.5 rounded-[10px] transition cursor-pointer font-bold text-xs ${is24Hour ? `${theme.toggleActive} shadow-sm` : theme.toggleInactive}`}>
                                        24H
                                    </div>
                                </div>
                            </div>

                            {/* Animation Style */}
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <span className={`text-sm font-bold ${theme.text}`}>{t('animations')}</span>
                                    <span className={`text-[11px] ${theme.textMuted} opacity-60 leading-tight`}>{t('animationsDesc')}</span>
                                </div>
                                <div className={`flex shadow-sm border rounded-xl p-1 gap-1 text-[10px] uppercase tracking-wider font-bold ${theme.toggleBg}`}>
                                    <div onClick={() => setAnimationStyle('morph')}
                                        className={`flex-1 text-center py-2 rounded-[10px] transition cursor-pointer ${animationStyle === 'morph' ? `${theme.toggleActive} shadow-sm` : theme.toggleInactive}`}>
                                        {t('morph')}
                                    </div>
                                    <div onClick={() => setAnimationStyle('liquid')}
                                        className={`flex-1 text-center py-2 rounded-[10px] transition cursor-pointer ${animationStyle === 'liquid' ? `${theme.toggleActive} shadow-sm` : theme.toggleInactive}`}>
                                        {t('liquid')}
                                    </div>
                                    <div onClick={() => setAnimationStyle('static')}
                                        className={`flex-1 text-center py-2 rounded-[10px] transition cursor-pointer ${animationStyle === 'static' ? `${theme.toggleActive} shadow-sm` : theme.toggleInactive}`}>
                                        {t('static')}
                                    </div>
                                </div>
                            </div>

                            {/* Standby Background */}
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <span className={`text-sm font-bold ${theme.text}`}>{t('standbyBg')}</span>
                                    <span className={`text-[11px] ${theme.textMuted} opacity-60 leading-tight`}>{t('standbyBgDesc')}</span>
                                </div>
                                <div className={`grid grid-cols-2 shadow-sm border rounded-xl p-1 gap-1 text-[10px] uppercase tracking-wider font-bold ${theme.toggleBg}`}>
                                    <div onClick={() => setStandbyBg('metaballs')}
                                        className={`py-2 rounded-[10px] text-center transition cursor-pointer ${standbyBg === 'metaballs' ? `${theme.toggleActive} shadow-sm` : theme.toggleInactive}`}>
                                        {t('metaballs')}
                                    </div>
                                    <div onClick={() => setStandbyBg('distortion')}
                                        className={`py-2 rounded-[10px] text-center transition cursor-pointer ${standbyBg === 'distortion' ? `${theme.toggleActive} shadow-sm` : theme.toggleInactive}`}>
                                        {t('distortion')}
                                    </div>
                                    <div onClick={() => setStandbyBg('css')}
                                        className={`py-2 rounded-[10px] text-center transition cursor-pointer ${standbyBg === 'css' ? `${theme.toggleActive} shadow-sm` : theme.toggleInactive}`}>
                                        {t('css')}
                                    </div>
                                    <div onClick={() => setStandbyBg('none')}
                                        className={`py-2 rounded-[10px] text-center transition cursor-pointer ${standbyBg === 'none' ? `${theme.toggleActive} shadow-sm` : theme.toggleInactive}`}>
                                        {t('none')}
                                    </div>
                                </div>
                            </div>

                            {/* Language */}
                            <div className="flex justify-between items-center gap-4 pt-1">
                                <div className="flex flex-col gap-0.5">
                                    <span className={`text-sm font-bold ${theme.text}`}>{t('language')}</span>
                                    <span className={`text-[11px] ${theme.textMuted} opacity-60 leading-tight`}>Choose your language</span>
                                </div>
                                <div className={`flex shrink-0 shadow-sm border rounded-xl p-1 gap-1 ${theme.toggleBg}`}>
                                    <div onClick={() => setLanguage('en')}
                                        className={`px-4 py-1.5 rounded-[10px] transition cursor-pointer font-bold text-xs ${language === 'en' ? `${theme.toggleActive} shadow-sm` : theme.toggleInactive}`}>
                                        EN
                                    </div>
                                    <div onClick={() => setLanguage('id')}
                                        className={`px-4 py-1.5 rounded-[10px] transition cursor-pointer font-bold text-xs ${language === 'id' ? `${theme.toggleActive} shadow-sm` : theme.toggleInactive}`}>
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
