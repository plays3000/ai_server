import { ko_info, ko } from './locales/ko.js';
import { en_info, en } from './locales/en.js';
import { ja_info, ja } from './locales/ja.js';
import { zh_cn_info, zh_cn } from './locales/zh-cn.js';
import { zh_tw_info, zh_tw } from './locales/zh-tw.js';

import { LocaleInfo, LocaleResource } from './types.js';

export type LanguageCode = 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW';

export const locale_infos: Record<LanguageCode, LocaleInfo> = {
    ko: ko_info,
    en: en_info,
    ja: ja_info,
    'zh-CN': zh_cn_info, 
    'zh-TW': zh_tw_info  
};

export const translations: Record<LanguageCode, LocaleResource> = {
    ko: ko,
    en: en,
    ja: ja,
    'zh-CN': zh_cn, 
    'zh-TW': zh_tw  
};

export type { LocaleResource, LocaleInfo };