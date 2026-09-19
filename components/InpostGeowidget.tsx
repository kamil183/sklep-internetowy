"use client";

import { useEffect } from "react";
import Script from "next/script";

/**
 * Thin wrapper around InPost's own Geowidget custom element.
 * We do NOT draw our own map or maintain our own list of Paczkomaty —
 * the widget and its data come entirely from InPost.
 *
 * Requires NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN (a public, org-scoped token
 * from the InPost dla Biznesu / Manager Paczek panel — safe to expose on
 * the client, unlike the ShipX API secret used in lib/inpost.ts).
 */
export default function InpostGeowidget({ onSelect }: { onSelect: (pointCode: string) => void }) {
  useEffect(() => {
    (window as any).afterPointSelected = (point: { name: string }) => {
      onSelect(point.name);
    };
    return () => {
      delete (window as any).afterPointSelected;
    };
  }, [onSelect]);

  const token = process.env.NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN;

  if (!token) {
    return (
      <div className="border border-line rounded p-4 text-sm text-creamdim">
        Widget wyboru Paczkomatu pojawi się tutaj po skonfigurowaniu
        <code className="mx-1 text-amber">NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN</code>
        w zmiennych środowiskowych (token z panelu InPost dla Biznesu).
      </div>
    );
  }

  return (
    <>
      <link rel="stylesheet" href="https://geowidget.easypack24.net/css/easypack.css" />
      <Script src="https://geowidget.easypack24.net/js/sdk-for-javascript.js" strategy="beforeInteractive" />
      {/* @ts-expect-error — custom element provided by InPost's SDK script */}
      <inpost-geowidget
        onpoint="afterPointSelected"
        token={token}
        language="pl"
        config="parcelCollect"
        style={{ display: "block", minHeight: 420 }}
      />
    </>
  );
}
