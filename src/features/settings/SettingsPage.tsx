import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { DEMO_CLINIC } from '@/features/auth/demoData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import {
  Building2,
  Users,
  ShieldCheck,
  Globe,
  Save,
  CheckCircle2,
  UserPlus,
  Mail,
  Phone,
} from 'lucide-react';
import { UserProfile, UserRole } from '@/types';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isDentist } = useAuth();

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
  const [newMemberPhone, setNewMemberPhone] = useState('+2126');

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
        <p className="text-sm text-slate-500">
          Configuration générale du cabinet dentaire, habilitations de l'équipe et conformité CNDP
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Clinic Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <CardTitle className="text-base font-bold text-slate-800">
                  Fiche & En-tête Légal du Cabinet
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Ces mentions figureront sur vos ordonnances, devis et factures d'honoraires
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveClinicSettings} className="space-y-4">
                <div className="space-y-1">
                  <Label>Raison sociale / Nom du Cabinet *</Label>
                  <Input
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>N° INPE / Ordre National des Médecins Dentistes *</Label>
                    <Input
                      required
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Identifiant Commun de l'Entreprise (ICE)</Label>
                    <Input
                      value={ice}
                      onChange={(e) => setIce(e.target.value)}
                      placeholder="Ex: 001548792000034"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Adresse</Label>
                    <Input
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Ville</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Téléphone Fixe / Standard</Label>
                    <Input
                      value={phone1}
                      onChange={(e) => setPhone1(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Téléphone Mobile (Rappels WhatsApp)</Label>
                    <Input
                      value={phone2}
                      onChange={(e) => setPhone2(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Email officiel du cabinet</Label>
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
                    Enregistrer les modifications
                  </Button>

                  {savedSuccess && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Paramètres mis à jour avec succès
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
                  Utilisateurs & Rôles de l'Équipe
                </CardTitle>
                <CardDescription className="text-xs">
                  Gestion des accès selon la matrice de permissions CNDP
                </CardDescription>
              </div>

              <Button
                size="sm"
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
              >
                <UserPlus className="w-3.5 h-3.5 me-1" />
                Ajouter un collaborateur
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
                          {member.role === 'dentist'
                            ? 'Chirurgien-Dentiste'
                            : member.role === 'assistant'
                            ? 'Assistante'
                            : 'Secrétaire'}
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
                        Compte Actif
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preferences & CNDP Information */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Paramètres Régionaux (Maroc)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Devise Principale</span>
                <span className="font-bold text-slate-800">Dirham Marocain (MAD)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Fuseau Horaire</span>
                <span className="font-bold text-slate-800">Africa/Casablanca (UTC+1)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Format de Date</span>
                <span className="font-bold text-slate-800">JJ/MM/AAAA</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Indicatif Téléphonique</span>
                <span className="font-bold text-slate-800">+212 (Maroc)</span>
              </div>
            </CardContent>
          </Card>

          {/* CNDP Law Notice */}
          <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/70 text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-teal-900">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Conformité Loi 09-08 & CNDP</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              DentaMaroc intègre le principe de minimisation des données, le recueil du consentement éclairé
              ainsi que le droit à l'oubli et à l'exportabilité de chaque dossier patient.
            </p>
            <p className="text-[11px] text-teal-800 font-medium">
              * Hébergement cloud en région Paris (europe-west9). Avant toute exploitation avec des patients réels,
              veillez à déposer une déclaration préalable de transfert auprès de la CNDP.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Add Collaborator */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogCloseButton onClose={() => setIsInviteModalOpen(false)} />
        <DialogHeader>
          <DialogTitle>Ajouter un membre à l'équipe</DialogTitle>
          <DialogDescription>
            Attribution des accès et du rôle pour la gestion du cabinet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInviteMember} className="space-y-4">
          <div className="space-y-1">
            <Label>Nom complet *</Label>
            <Input
              required
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Ex: Sara MANSOURI"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Email de connexion *</Label>
              <Input
                type="email"
                required
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="sara@cabinet.ma"
              />
            </div>
            <div className="space-y-1">
              <Label>Téléphone mobile (+212) *</Label>
              <Input
                required
                value={newMemberPhone}
                onChange={(e) => setNewMemberPhone(e.target.value)}
                placeholder="+2126XXXXXXXX"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Rôle attribué *</Label>
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium"
            >
              <option value="assistant">Assistante Dentaire (Accès clinique, sans suppression)</option>
              <option value="secretary">Secrétaire (Accueil, facturation, sans dossier médical)</option>
              <option value="dentist">Chirurgien-Dentiste Associé (Accès complet)</option>
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              Ajouter le compte
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};
