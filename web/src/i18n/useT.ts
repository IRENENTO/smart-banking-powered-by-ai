import { useEffect, useMemo, useState } from 'react';
import { getLang, Lang } from '../utils/preferences';
import { getDict, TranslationKey } from './translations';

type Params = Record<string, string | number>;

function format(template: string, params?: Params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

export function useT() {
  const [lang, setLang] = useState<Lang>(() => getLang());

  useEffect(() => {
    const onLang = (e: Event) => {
      const detail = (e as CustomEvent).detail as Lang | undefined;
      if (detail) setLang(detail);
    };
    const onStorage = () => setLang(getLang());
    window.addEventListener('pref:lang', onLang);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('pref:lang', onLang);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const dict = useMemo(() => getDict(lang), [lang]);

  const t = (key: TranslationKey, params?: Params) => format(dict[key], params);

  return { lang, t };
}

