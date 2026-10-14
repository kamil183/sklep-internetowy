"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

/**
 * Wrapper around InPost Geowidget v5 (official custom element).
 * Docs: https://geowidget.inpost.pl/docs/
 *
 * Key points that make it work in React/Next:
 *  - load the v5 SDK (`inpost-geowidget.js` from geowidget.inpost.pl),
 *    NOT the legacy v4 `sdk-for-javascript.js` (it does not register
 *    the <inpost-geowidget> element and the widget stays empty);
 *  - create/set up the element only AFTER the SDK is ready;
 *  - the element has no intrinsic height — we size the host div.
 *
 * Requires NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN (public, org-scoped token
 * from the InPost dla Biznesu / Manager Paczek panel -> API -> Geowidget).
 */
export default function InpostGeowidget({ onSelect }: { onSelect: (pointCode: string) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!sdkReady) return;
    const host = hostRef.current;
    if (!host) return;

    const widget = document.createElement("inpost-geowidget");
    widget.setAttribute("token", process.env.NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN ?? "");
    widget.setAttribute("language", "pl");
    widget.setAttribute("config", "parcelCollect");
    widget.setAttribute("onpoint", "afterPointSelected");
    // The custom element has no intrinsic height (per InPost docs) — size it explicitly.
    widget.style.cssText = "display:block;width:100%;height:480px";

    (window as any).afterPointSelected = (point: { name: string; [k: string]: unknown }) => {
      onSelectRef.current(String(point?.name ?? point));
    };

    host.replaceChildren(widget);

    return () => {
      delete (window as any).afterPointSelected;
      widget.remove();
    };
  }, [sdkReady]);

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
      {/* Geowidget v5 assets (PL market, production) — must match the token.
          CSS in head, SDK after so it doesn't block hydration. */}
      <link rel="stylesheet" href="https://geowidget.inpost.pl/inpost-geowidget.css" />
      <link rel="preconnect" href="https://geowidget.inpost.pl" />
      <Script
        src="https://geowidget.inpost.pl/inpost-geowidget.js"
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
      />
      <div ref={hostRef}  />
    </>
  );
}
