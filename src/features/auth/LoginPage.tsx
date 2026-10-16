import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types';
import { Activity, ShieldCheck, Stethoscope, UserCheck, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { appConfig } from '@/config/app.config';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemoRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('dr.tazi@cabinet-tazi.ma');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, 'dentist');
    navigate('/');
  };

  const handleQuickDemo = (role: UserRole) => {
    loginAsDemoRole(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 flex flex-col justify-center items-center p-4">
      {/* Top bar with 4-language switcher */}
      <div className="absolute top-4 end-4">
        <LanguageSwitcher variant="login" />
      </div>

      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 mb-3 shadow-lg shadow-teal-900/40">
            <Activity className="w-9 h-9 text-teal-300" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {appConfig.app.name}
          </h1>
          <p className="text-sm text-teal-200/80 mt-1">{t('tagline')}</p>
        </div>

        {/* Login Card */}
        <Card className="border-teal-700/40 shadow-2xl backdrop-blur-md bg-white/95">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 text-center">
              {t('auth.loginTitle')}
            </CardTitle>
            <CardDescription className="text-center text-xs text-slate-500">
              {t('auth.complianceSubtitle', {
                law: appConfig.regional.regulatoryLaw,
                authority: appConfig.regional.regulatoryAuthority,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email">{t('auth.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="praticien@cabinet.ma"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">{t('auth.passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 mt-2"
              >
                {isLoading ? t('common.loading') : t('auth.submit')}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-medium">
                  {t('auth.demoAccounts')}
                </span>
              </div>
            </div>

            {/* Quick 1-click Demo buttons */}
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('dentist')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-900 text-start transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="w-5 h-5 text-teal-700 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">
                      Dr. Amine TAZI ({t('auth.loginAsDentist')})
                    </div>
                    <div className="text-[11px] text-teal-700">{t('auth.dentistPerms')}</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-teal-700">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('assistant')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-sky-900 text-start transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-sky-700 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">
                      Fatima Zohra ({t('auth.loginAsAssistant')})
                    </div>
                    <div className="text-[11px] text-sky-700">{t('auth.assistantPerms')}</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-sky-700">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('secretary')}
                className="flex items-center justify-between p-2.5 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-900 text-start transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-rose-700 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">
                      Nadia IDRISSI ({t('auth.loginAsSecretary')})
                    </div>
                    <div className="text-[11px] text-rose-700">{t('auth.secretaryPerms')}</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-rose-700">→</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Compliance badge */}
        <div className="mt-6 text-center text-xs text-teal-200/70 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {t('auth.footerCompliance', {
              authority: appConfig.regional.regulatoryAuthority,
              currency: appConfig.regional.currency,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
