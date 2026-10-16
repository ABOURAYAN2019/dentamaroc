import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEMO_CLINIC } from '@/features/auth/demoData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
} from '@/components/ui/dialog';
import {
  Building2,
  ShieldCheck,
  Save,
  CheckCircle2,
  UserPlus,
  Globe,
} from 'lucide-react';
import { UserProfile, UserRole } from '@/types';
import { appConfig } from '@/config/app.config';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  // Clinic profile state
  const [clinicName, setClinicName] = useState(DEMO_CLINIC.name);
  const [licenseNumber, setLicenseNumber] = useState(DEMO_CLINIC.licenseNumber);
  const [ice, setIce] = useState(DEMO_CLINIC.ice || '');
  const [street, setStreet] = useState(DEMO_CLINIC.address.street);
  const [city, setCity] = useState(DEMO_CLINIC.address.city);
  const [phone1, setPhone1] = useState(DEMO_CLINIC.phones[0]);
  const [phone2, setPhone2] = useState(DEMO_CLINIC.phones[1] || '');
  const [email, setEmail] = useState(DEMO_CLINIC.email);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Users team state
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([
    {
      id: 'user-dentist-1',
      email: 'dr.tazi@cabinet-tazi.ma',
      fullName: 'Dr. Amine TAZI',
      role: 'dentist',
      phone: '+212661305070',
      clinicId: DEMO_CLINIC.id,
      active: true,
      colorCode: '#0d9488',
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'user-assistant-1',
      email: 'fatima@cabinet-tazi.ma',
      fullName: 'Fatima Zohra BENJELLOUN',
      role: 'assistant',
      phone: '+212662445566',
      clinicId: DEMO_CLINIC.id,
      active: true,
      colorCode: '#0284c7',
      createdAt: '2026-01-05T08:00:00Z',
    },
    {
      id: 'user-secretary-1',
      email: 'nadia@cabinet-tazi.ma',
      fullName: 'Nadia IDRISSI',
      role: 'secretary',
      phone: '+212663778899',
      clinicId: DEMO_CLINIC.id,
      active: true,
      colorCode: '#e11d48',
      createdAt: '2026-01-08T08:00:00Z',
    },
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('assistant');
  const [newMemberPhone, setNewMemberPhone] = useState(`${appConfig.regional.countryDialPrefix}6`);

  const handleSaveClinicSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: UserProfile = {
      id: `user-${Date.now()}`,
      fullName: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      phone: newMemberPhone,
      clinicId: DEMO_CLINIC.id,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setTeamMembers([...teamMembers, newMember]);
    setIsInviteModalOpen(false);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('nav.settings')}</h1>
        <p className="text-sm text-slate-500">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Clinic Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <CardTitle className="text-base font-bold text-slate-800">
                  {t('settings.clinicProfile')}
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                {t('settings.clinicProfileDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveClinicSettings} className="space-y-4">
                <div className="space-y-1">
                  <Label>{t('settings.clinicNameLabel')}</Label>
                  <Input
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>{t('settings.licenseLabel')}</Label>
                    <Input
                      required
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('settings.iceLabel')}</Label>
                    <Input
                      value={ice}
                      onChange={(e) => setIce(e.target.value)}
                      placeholder="Ex: 001548792000034"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>{t('settings.addressLabel')}</Label>
                    <Input
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('settings.cityLabel')}</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>{t('settings.landlineLabel')}</Label>
                    <Input
                      value={phone1}
                      onChange={(e) => setPhone1(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('settings.mobileLabel')}</Label>
                    <Input
                      value={phone2}
                      onChange={(e) => setPhone2(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>{t('settings.emailLabel')}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  >
                    <Save className="w-4 h-4 me-1.5" />
                    {t('settings.saveChanges')}
                  </Button>

                  {savedSuccess && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {t('settings.savedSuccess')}
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">
                  {t('settings.teamTitle')}
                </CardTitle>
                <CardDescription className="text-xs">{t('settings.teamDesc')}</CardDescription>
              </div>

              <Button
                size="sm"
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
              >
                <UserPlus className="w-3.5 h-3.5 me-1" />
                {t('settings.addCollaborator')}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{member.fullName}</span>
                        <Badge
                          variant={
                            member.role === 'dentist'
                              ? 'default'
                              : member.role === 'assistant'
                              ? 'info'
                              : 'warning'
                          }
                          className="text-[10px]"
                        >
                          {t(`roles.${member.role}`)}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>{member.email}</span>
                        <span>•</span>
                        <span>{member.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        {t('common.activeAccount')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Language Selector, Preferences & CNDP Information */}
        <div className="space-y-6">
          {/* Interactive Language Card */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600" />
                <CardTitle className="text-sm font-bold text-slate-800">
                  {t('languages.label')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <LanguageSwitcher variant="cards" />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                {t('settings.regionalSettings', { city: appConfig.regional.defaultCity })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{t('settings.mainCurrency')}</span>
                <span className="font-bold text-slate-800">{appConfig.regional.currency}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{t('settings.timezone')}</span>
                <span className="font-bold text-slate-800">{appConfig.regional.timezone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{t('settings.dateFormat')}</span>
                <span className="font-bold text-slate-800">JJ/MM/AAAA ({appConfig.regional.locale})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{t('settings.dialCode')}</span>
                <span className="font-bold text-slate-800">{appConfig.regional.countryDialPrefix}</span>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Law Notice */}
          <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/70 text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-teal-900">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>
                {t('settings.complianceTitle', {
                  law: appConfig.regional.regulatoryLaw,
                  authority: appConfig.regional.regulatoryAuthority,
                })}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t('settings.complianceBody', { appName: appConfig.app.name })}
            </p>
            <p className="text-[11px] text-teal-800 font-medium">
              {t('settings.complianceCloudNote', {
                region: appConfig.firebase.region,
                authority: appConfig.regional.regulatoryAuthority,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Add Collaborator */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogCloseButton onClose={() => setIsInviteModalOpen(false)} />
        <DialogHeader>
          <DialogTitle>{t('settings.addCollaborator')}</DialogTitle>
          <DialogDescription>{t('settings.teamDesc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInviteMember} className="space-y-4">
          <div className="space-y-1">
            <Label>{t('patients.lastName')} *</Label>
            <Input
              required
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Ex: Sara MANSOURI"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{t('common.email')} *</Label>
              <Input
                type="email"
                required
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="sara@cabinet.ma"
              />
            </div>
            <div className="space-y-1">
              <Label>{t('common.phone')} *</Label>
              <Input
                required
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
                placeholder={`${appConfig.regional.countryDialPrefix}6XXXXXXXX`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>{t('roles.activeRole')}</Label>
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium"
            >
              <option value="assistant">{t('roles.assistant')}</option>
              <option value="secretary">{t('roles.secretary')}</option>
              <option value="dentist">{t('roles.dentist')}</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {t('common.add')}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};
