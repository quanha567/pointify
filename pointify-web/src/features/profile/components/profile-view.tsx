import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, ArrowRight, Shield, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TypographyH2, TypographyMuted } from '@/components/ui/typography';
import { FloatingShapes } from '@/components/floating-shapes';
import { useAuthStore } from '@/store/useAuthStore';
import { ProfileHeaderCard } from './profile-header-card';
import { ProfileInfoForm } from './profile-info-form';
import { SecuritySettingsCard } from './security-settings-card';
import { AvatarPickerModal } from './avatar-picker-modal';

export function ProfileView() {
  const { t } = useTranslation();
  const { user, isGuest, updateProfileData, changePassword, sendPasswordReset } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Handle Guest Participant case
  if (isGuest || !user) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <FloatingShapes />
        <Card className="relative z-10 max-w-md w-full rounded-2xl border-border bg-card shadow-lg text-center p-6">
          <CardHeader className="items-center pb-3 p-0 space-y-2">
            <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="size-5" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              {t('profile.guestSessionTitle')}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              {t('profile.guestSessionDesc')}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-2.5 pt-5 p-0">
            <Button asChild className="w-full sm:w-auto text-sm font-medium gap-2 h-10 px-4">
              <Link to="/auth" search={{ mode: 'register' }}>
                <Sparkles className="size-4" />
                <span>{t('account.upgradeToAccount')}</span>
                <ArrowRight className="size-3.5 ml-0.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto text-sm h-10 px-4">
              <Link to="/">{t('common.backToHome')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <FloatingShapes />

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Page Title & Description */}
        <div className="space-y-1.5">
          <TypographyH2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground border-b-0 pb-0">
            {t('profile.title')}
          </TypographyH2>
          <TypographyMuted className="text-sm sm:text-base leading-relaxed">
            {t('profile.description')}
          </TypographyMuted>
        </div>

        {/* Bento Grid 2 Columns: Sidebar (4 cols) + Main Workspace (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Card Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <ProfileHeaderCard user={user} onOpenAvatarPicker={() => setAvatarModalOpen(true)} />
          </div>

          {/* Right Column: Unified Card containing Tabs inside */}
          <div className="lg:col-span-8">
            <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as 'profile' | 'security')}
                className="w-full"
              >
                {/* Tab Navigation inside Card Header */}
                <div className="border-b border-border p-4 px-6 bg-muted/20">
                  <TabsList className="grid grid-cols-2 w-full sm:w-96 h-10 p-1">
                    <TabsTrigger value="profile" className="gap-2 text-sm font-medium h-full">
                      <User className="size-4 text-primary" />
                      <span>{t('profile.tabProfile')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2 text-sm font-medium h-full">
                      <Shield className="size-4 text-primary" />
                      <span>{t('profile.tabSecurity')}</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab 1: Profile Information */}
                <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
                  <ProfileInfoForm
                    user={user}
                    onUpdateProfile={async (name, photo) => {
                      await updateProfileData(name, photo);
                    }}
                  />
                </TabsContent>

                {/* Tab 2: Security & Password */}
                <TabsContent value="security" className="mt-0 focus-visible:outline-none">
                  <SecuritySettingsCard
                    user={user}
                    onChangePassword={changePassword}
                    onSendPasswordReset={sendPasswordReset}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* Shared Mascot Avatar Picker Modal */}
      <AvatarPickerModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        currentPhotoURL={user.photoURL}
        onSelectAvatar={async (newPhotoURL) => {
          await updateProfileData(user.displayName || 'User', newPhotoURL);
        }}
      />
    </div>
  );
}
