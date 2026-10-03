"use client";

import {
  Bell,
  CaretLeft,
  CaretRight,
  FirstAidKit,
  House,
  MapPin,
  Phone,
  Warning,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEmergencyMode } from "@/components/emergency/EmergencyModeProvider";
import { useLocalization } from "@/components/localization/LocalizationProvider";

export function CrisisScreen() {
  const router = useRouter();
  const { activateEmergency, deactivateEmergency } = useEmergencyMode();
  const { messages } = useLocalization();
  const copy = messages.crisisMode;

  useEffect(() => {
    activateEmergency();
  }, [activateEmergency]);

  function handleExit() {
    deactivateEmergency();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  const menuItems = [
    {
      href: "/map",
      icon: House,
      id: "shelters",
      title: copy.links.shelters,
    },
    {
      href: "/settings/important-numbers",
      icon: Phone,
      id: "numbers",
      title: copy.links.numbers,
    },
    {
      href: "/family",
      icon: MapPin,
      id: "family-location",
      title: copy.links.familyLocation,
    },
    {
      href: "/alerts",
      icon: Bell,
      id: "alerts",
      title: copy.links.alerts,
    },
    {
      href: "/settings/guides",
      icon: FirstAidKit,
      id: "guides",
      title: copy.links.guides,
    },
  ];

  return (
    <main className="crisis-screen">
      <div className="crisis-screen__container">
        <header className="crisis-screen__header">
          <button
            aria-label={copy.backLabel}
            className="crisis-screen__back-button"
            onClick={handleExit}
            type="button"
          >
            <CaretLeft aria-hidden="true" size={24} weight="bold" />
          </button>
          <p className="crisis-screen__header-title">{copy.title}</p>
        </header>

        <section aria-labelledby="crisis-hero-title" className="crisis-screen__hero">
          <div aria-hidden="true" className="crisis-screen__badge-wrapper">
            <div className="crisis-screen__badge">
              <Warning size={48} weight="bold" />
            </div>
          </div>
          <h1 className="crisis-screen__title" id="crisis-hero-title">
            {copy.title}
          </h1>
          <p className="crisis-screen__description">{copy.description}</p>
        </section>

        <nav aria-label={copy.title} className="crisis-screen__menu-card">
          <ul className="crisis-screen__list">
            {menuItems.map(({ href, icon: Icon, id, title }) => (
              <li key={id}>
                <Link className="crisis-screen__link" href={href}>
                  <span className="crisis-screen__link-main">
                    <Icon aria-hidden="true" className="crisis-screen__link-icon" size={26} weight="bold" />
                    <span className="crisis-screen__link-label">{title}</span>
                  </span>
                  <CaretRight aria-hidden="true" className="crisis-screen__link-arrow" size={20} weight="bold" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="crisis-screen__footer">
          <button
            className="crisis-screen__exit-button"
            onClick={handleExit}
            type="button"
          >
            {copy.exitAction}
          </button>
        </footer>
      </div>
    </main>
  );
}
