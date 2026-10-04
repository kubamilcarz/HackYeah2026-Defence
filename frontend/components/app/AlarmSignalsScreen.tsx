"use client";

import { SpeakerHigh } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { Alert } from "@/components/ui/Alert";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { Tag } from "@/components/ui/Tag";

const SOURCE_URL = "https://www.gov.pl/web/kppsp-ilawa/kontrola-systemu-ostrzegania-i-alarmowania-w-powiecie-ilawskim";

const signalAudioUrls = {
  civilianAnnouncement: "https://www.gov.pl/attachment/4ab2886d-49d9-4555-81de-99fc16f40cb8",
  civilianCancellation: "https://www.gov.pl/attachment/77317310-0391-4a01-88e4-cd0081f8fe63",
  fireProtection: "https://www.gov.pl/attachment/0a34caa9-7ed9-42e7-868f-2fb73e66afe4",
  training: "https://www.gov.pl/attachment/2336cdbc-2a0e-4734-909b-be40bb8b6e8d",
} as const;

type SignalId = keyof typeof signalAudioUrls;

export function AlarmSignalsScreen() {
  const { locale, messages } = useLocalization();
  const copy = messages.alarmSignals;
  const audioElements = useRef(new Map<SignalId, HTMLAudioElement>());
  const [unavailableSignalIds, setUnavailableSignalIds] = useState<SignalId[]>([]);

  const signals = (Object.keys(signalAudioUrls) as SignalId[]).map((id) => ({
    ...copy.signals[id],
    audioUrl: signalAudioUrls[id],
    id,
  }));

  function setAudioElement(id: SignalId, element: HTMLAudioElement | null) {
    if (element) {
      audioElements.current.set(id, element);
      return;
    }
    audioElements.current.delete(id);
  }

  function pauseOtherAudio(currentId: SignalId) {
    for (const [id, audio] of audioElements.current) {
      if (id !== currentId && !audio.paused) audio.pause();
    }
  }

  function markAudioUnavailable(id: SignalId) {
    setUnavailableSignalIds((current) => current.includes(id) ? current : [...current, id]);
  }

  return (
    <main className="alarm-signals-page" lang={locale}>
      <PageNavigationBar backHref="/" backLabel={copy.backLabel} title={copy.title} />
      <div className="alarm-signals-page__content">
        <header className="alarm-signals-page__hero">
          <div aria-hidden="true" className="alarm-signals-page__hero-icon">
            <SpeakerHigh size={28} weight="bold" />
          </div>
          <div>
            <h1 className="type-h1">{copy.title}</h1>
            <p className="type-body">{copy.intro}</p>
          </div>
        </header>

        <Alert description={copy.noticeDescription} title={copy.noticeTitle} variant="warning" />

        <section aria-labelledby="alarm-signal-list-heading" className="alarm-signals-page__section">
          <h2 className="type-h2" id="alarm-signal-list-heading">{copy.listHeading}</h2>
          <ul className="alarm-signals-page__list">
            {signals.map(({ audioUrl, description, duration, id, meaning, pattern, title }) => {
              const unavailable = unavailableSignalIds.includes(id);

              return (
                <li key={id}>
                  <article className="alarm-signals-page__card">
                    <header className="alarm-signals-page__card-heading">
                      <div aria-hidden="true" className="alarm-signals-page__card-icon">
                        <SpeakerHigh size={24} weight="bold" />
                      </div>
                      <div className="alarm-signals-page__card-title">
                        <h3 className="type-h3">{title}</h3>
                        <p className="type-caption">{description}</p>
                      </div>
                      <Tag label={duration} />
                    </header>
                    <p className="type-body alarm-signals-page__meaning">
                      <span className="alarm-signals-page__meaning-label">{copy.meaningLabel}</span>
                      {meaning}
                    </p>
                    <dl className="alarm-signals-page__details">
                      <div>
                        <dt className="type-caption">{copy.patternLabel}</dt>
                        <dd className="type-body">{pattern}</dd>
                      </div>
                    </dl>
                    <audio
                      aria-label={copy.audioLabel.replace("{title}", title)}
                      className="alarm-signals-page__audio"
                      controls
                      onError={() => markAudioUnavailable(id)}
                      onPlay={() => pauseOtherAudio(id)}
                      preload="metadata"
                      ref={(element) => setAudioElement(id, element)}
                      src={audioUrl}
                    >
                      {copy.audioUnsupported}
                    </audio>
                    {unavailable && (
                      <p className="alarm-signals-page__error" role="status">
                        {copy.audioUnavailable} <a href={SOURCE_URL} rel="noopener noreferrer" target="_blank">{copy.openSource}</a>
                      </p>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="alarm-signals-page__source">
          <h2 className="type-h3">{copy.sourceHeading}</h2>
          <p className="type-caption">{copy.sourceDescription}</p>
          <a className="alarm-signals-page__source-link" href={SOURCE_URL} rel="noopener noreferrer" target="_blank">
            {copy.openSource}
          </a>
        </footer>
      </div>
    </main>
  );
}
