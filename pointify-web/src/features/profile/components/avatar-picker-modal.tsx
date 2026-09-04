import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TypographySmall } from '@/components/ui/typography';
import {
  MASCOT_LIST,
  type MascotCategory,
  type MascotType,
  getMascotFromPhotoUrl,
} from '@/features/room/components/canvas/mascots/mascot-registry';

interface AvatarPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhotoURL?: string | null;
  onSelectAvatar: (imageSrc: string) => Promise<void> | void;
}

export function AvatarPickerModal({
  open,
  onOpenChange,
  currentPhotoURL,
  onSelectAvatar,
}: AvatarPickerModalProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  const initialMascot = useMemo(() => {
    return getMascotFromPhotoUrl(currentPhotoURL) ?? MASCOT_LIST[0];
  }, [currentPhotoURL]);

  const [selectedMascotId, setSelectedMascotId] = useState<MascotType>(initialMascot.id);
  const [activeCategory, setActiveCategory] = useState<MascotCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync selection whenever modal opens or current avatar changes
  useEffect(() => {
    if (open) {
      const current = getMascotFromPhotoUrl(currentPhotoURL) ?? MASCOT_LIST[0];
      setSelectedMascotId(current.id);
      setSearchQuery('');
    }
  }, [open, currentPhotoURL]);

  const filteredMascots = useMemo(() => {
    return MASCOT_LIST.filter((m) => {
      const matchCategory = activeCategory === 'all' || m.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.nameVi.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const selectedMascot = useMemo(() => {
    return MASCOT_LIST.find((m) => m.id === selectedMascotId) ?? MASCOT_LIST[0];
  }, [selectedMascotId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSelectAvatar(selectedMascot.imageSrc);
      toast.success(t('profile.avatarUpdateSuccessToast'));
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('profile.avatarUpdateFailedToast');
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold">{t('profile.chooseAvatarTitle')}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {t('profile.chooseAvatarDesc')}
          </DialogDescription>
        </DialogHeader>

        {/* Search and Category Tabs */}
        <div className="px-6 pb-3 space-y-3">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('profile.searchAvatarPlaceholder')}
              className="text-sm"
            />
          </InputGroup>

          <Tabs
            value={activeCategory}
            onValueChange={(val) => setActiveCategory(val as MascotCategory)}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-5 h-9 sm:h-10 p-1">
              <TabsTrigger value="all" className="text-xs sm:text-sm font-medium">
                {t('profile.categoryAll')} ({MASCOT_LIST.length})
              </TabsTrigger>
              <TabsTrigger value="pets" className="text-xs sm:text-sm font-medium">
                {t('profile.categoryPets')} (7)
              </TabsTrigger>
              <TabsTrigger value="wild" className="text-xs sm:text-sm font-medium">
                {t('profile.categoryWild')} (12)
              </TabsTrigger>
              <TabsTrigger value="ocean" className="text-xs sm:text-sm font-medium">
                {t('profile.categoryOcean')} (5)
              </TabsTrigger>
              <TabsTrigger value="fantasy" className="text-xs sm:text-sm font-medium">
                {t('profile.categoryFantasy')} (2)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Mascot Grid */}
        <div className="px-6 max-h-[380px] overflow-y-auto">
          {filteredMascots.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {t('profile.noMascotFound')}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 py-2">
              {filteredMascots.map((mascot) => {
                const isSelected = selectedMascotId === mascot.id;
                const displayName = isVi ? mascot.nameVi : mascot.nameEn;

                return (
                  <button
                    key={mascot.id}
                    type="button"
                    onClick={() => setSelectedMascotId(mascot.id)}
                    className={`relative flex flex-col items-center p-2.5 rounded-xl border transition-colors cursor-pointer text-center ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                        : 'border-border bg-card hover:bg-accent'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="size-2.5 stroke-[3]" />
                      </div>
                    )}

                    <div className="size-14 sm:size-16 flex items-center justify-center">
                      <img
                        src={mascot.imageSrc}
                        alt={displayName}
                        className="size-full object-contain"
                        loading="lazy"
                      />
                    </div>

                    <TypographySmall className="text-xs sm:text-sm font-medium text-foreground mt-1.5 truncate max-w-full">
                      {displayName}
                    </TypographySmall>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 px-6 flex flex-row items-center justify-between sm:justify-between border-t border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg border bg-background p-0.5 flex items-center justify-center shrink-0">
              <img
                src={selectedMascot.imageSrc}
                alt={isVi ? selectedMascot.nameVi : selectedMascot.nameEn}
                className="size-full object-contain"
              />
            </div>
            <TypographySmall className="text-sm font-semibold text-foreground">
              {isVi ? selectedMascot.nameVi : selectedMascot.nameEn}
            </TypographySmall>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="h-9 sm:h-10 px-4 text-sm font-medium"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2 h-9 sm:h-10 px-4 text-sm font-medium"
            >
              <Check className="size-4" />
              <span>{isSaving ? t('profile.saving') : t('profile.confirmAvatar')}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
