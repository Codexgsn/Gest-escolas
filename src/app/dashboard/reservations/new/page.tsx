
'use client';

import { NewReservationForm } from "@/components/reservations/new-reservation-form";
import { useState, useEffect } from "react";
import { fetchResources } from "@/lib/data";
import { getSettings, type SchoolSettings } from "@/app/actions/settings";
import { Resource } from "@/lib/definitions";

export default function NewReservationPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resourcesData, settingsData] = await Promise.all([
          fetchResources(),
          getSettings()
        ]);
        setResources(resourcesData);
        setSettings(settingsData);
      } catch (error) {
        console.error("Error loading reservation data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !settings) {
    return <div>Carregando recursos e configurações...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Criar Nova Reserva</h1>
      <NewReservationForm resources={resources} settings={settings} />
    </div>
  );
}
