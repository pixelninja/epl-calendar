import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Globe } from '@/components/icons'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
]

interface LanguageSelectorProps {
  value: string
  onValueChange: (language: string) => void
  className?: string
  showLabel?: boolean
}

export function LanguageSelector({
  value,
  onValueChange,
  className,
  showLabel = true
}: LanguageSelectorProps) {
  const selectedLanguage = LANGUAGES.find(lang => lang.code === value)
  
  // Get browser language as fallback
  const getBrowserLanguage = () => {
    const browserLang = navigator.language.split('-')[0]
    return LANGUAGES.find(lang => lang.code === browserLang)?.code || 'en'
  }

  return (
    <div className={className}>
      {showLabel && (
        <Label htmlFor="language-select" className="text-sm font-medium mb-2 flex items-center gap-1">
          <Globe className="h-4 w-4" />
          Language
        </Label>
      )}
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="language-select" className="w-full">
          <SelectValue placeholder="Select language">
            {selectedLanguage ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedLanguage.flag}</span>
                <span>{selectedLanguage.nativeName}</span>
                <span className="text-muted-foreground text-sm">({selectedLanguage.name})</span>
              </div>
            ) : (
              'Select language'
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {LANGUAGES.map(language => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <span>{language.nativeName}</span>
                <span className="text-muted-foreground text-sm">({language.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {value !== 'en' && (
        <p className="text-xs text-muted-foreground mt-1">
          Note: Currently only English is fully supported. Other languages are planned for future releases.
        </p>
      )}
      
      {value === getBrowserLanguage() && value !== 'en' && (
        <p className="text-xs text-primary mt-1">
          This matches your browser language
        </p>
      )}
    </div>
  )
}