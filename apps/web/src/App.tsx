import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { getSharedI18n } from "@mity-garden/i18n";
import { ProjectListPage } from "./pages/ProjectListPage.js";
import { DesignPage } from "./pages/DesignPage.js";
import { AppShell } from "./layouts/AppShell.js";
import { ProjectWizard } from "@mity-garden/shared-ui";
import { useUiStore } from "@mity-garden/shared-ui";

function LocaleSync(): null {
  const locale = useUiStore((s) => s.locale);
  useEffect(() => {
    void getSharedI18n().changeLanguage(locale);
  }, [locale]);
  return null;
}


function WizardController(): React.ReactElement | null {
  const wizardOpen = useUiStore((s) => s.wizardOpen);
  const closeWizard = useUiStore((s) => s.closeWizard);
  const navigate = useNavigate();

  if (!wizardOpen) return null;

  return (
    <ProjectWizard
      onComplete={() => {
        closeWizard();
        void navigate("/design");
      }}
      onCancel={closeWizard}
    />
  );
}

export function App(): React.ReactElement {
  const i18n = getSharedI18n();

  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <LocaleSync />
        <WizardController />
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<ProjectListPage />} />
            <Route path="design" element={<DesignPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </I18nextProvider>
  );
}
