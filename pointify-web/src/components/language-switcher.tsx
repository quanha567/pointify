import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAppStore, type SupportedLanguage } from '@/store/useAppStore';

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  countryCode: string; // ISO 3166-1 alpha-2 lowercase for Flag CDN
}

const LANGUAGES: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt', countryCode: 'vn' },
  { code: 'en', label: 'English', countryCode: 'gb' },
];

/**
 * Flag component powered by FlagCDN (SVG vector flag with fallback & retina support)
 */
function CountryFlag({ countryCode, alt }: { countryCode: string; alt: string }) {
  return (
    <img
      src={`https://flagcdn.com/${countryCode}.svg`}
      alt={alt}
      width={18}
      height={13}
      loading="lazy"
      className="size-4.5 aspect-4/3 rounded-[3px] object-cover shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.12)] border border-black/10 dark:border-white/15"
    />
  );
}

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();

  const currentLang = LANGUAGES.find((l) => l.code === (language || i18n.language)) || LANGUAGES[0];

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8.5 px-2.5 gap-2 rounded-lg border-border/80 bg-background/80 hover:bg-accent/80 backdrop-blur shadow-2xs transition-all text-xs font-medium cursor-pointer"
        >
          <CountryFlag countryCode={currentLang.countryCode} alt={currentLang.label} />
          <span className="hidden sm:inline font-semibold">{currentLang.label}</span>
          <ChevronDown className="size-3 text-muted-foreground transition-transform duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 p-1 rounded-xl shadow-lg border-border/80">
        {LANGUAGES.map((lang) => {
          const isSelected = lang.code === currentLang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CountryFlag countryCode={lang.countryCode} alt={lang.label} />
                <span>{lang.label}</span>
              </div>
              {isSelected && <Check className="size-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
