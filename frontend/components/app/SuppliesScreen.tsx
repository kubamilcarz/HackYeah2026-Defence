"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  BatteryCharging,
  Bell,
  Check,
  CheckCircle,
  Clock,
  Drop,
  FirstAidKit,
  Flashlight,
  Package,
  PencilSimple,
  Plus,
  ShieldCheck,
  Sparkle,
  Trash,
  UsersThree,
  WarningCircle,
} from "@phosphor-icons/react/ssr";
import { Alert } from "@/components/ui/Alert";
import { Button, IconButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CheckboxGroup, DateField, SearchField, SelectField, TextField } from "@/components/ui/FormControls";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { CircularProgress } from "@/components/ui/Progress";
import { Tag, type TagVariant } from "@/components/ui/Tag";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import {
  getInitials,
  getMedicalProfilesServerSnapshot,
  getMedicalProfilesSnapshot,
  subscribeToMedicalProfiles,
} from "@/components/app/medical";
import {
  SUPPLY_CATEGORIES,
  SUPPLY_UNITS,
  STARTER_ITEM_NAMES,
  autoAdjustSuppliesForFamily,
  calculateRecommendedTargets,
  createSupplyItem,
  deleteSupplyItem,
  getFamilyMedicalRequirements,
  householdSupplyRecommendations,
  getSuppliesServerSnapshot,
  getSuppliesSnapshot,
  isSupplyReady,
  saveAllSupplies,
  supplyIssues,
  subscribeToSupplies,
  updateSupplyItem,
  type FamilyMedicalNeed,
  type InventoryIssue,
  type SupplyItem,
  type SupplyItemInput,
  type SupplyRecommendation,
} from "@/components/app/supplies";
import { getNotificationPreferencesSnapshot } from "@/components/app/notification-preferences";

const REMINDER_STORAGE_KEY = "plan-0-supply-reminders-v1";
const REMINDER_SENT_STORAGE_KEY = "plan-0-supply-reminder-last-sent-v1";
type ReminderKind = "expiry" | "restock";

type SupplyFormValues = {
  category: SupplyItem["category"];
  expiresOn: string;
  name: string;
  onHand: string;
  target: string;
  unit: SupplyItem["unit"];
  memberId: string;
};

type StatusFilter = "all" | "attention" | "ready";

const EMPTY_FORM: SupplyFormValues = {
  name: "",
  category: "water-food",
  onHand: "0",
  target: "1",
  unit: "items",
  expiresOn: "",
  memberId: "",
};

function formatPeopleCount(count: number, locale: string): string {
  if (locale === "pl") {
    if (count === 1) return "1 osoby";
    return `${count} osób`;
  }
  return count === 1 ? "1 person" : `${count} people`;
}

function formatHouseholdPeople(count: number, locale: string): string {
  if (locale === "pl") {
    if (count === 1) return "1 osoba";
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return `${count} osoby`;
    }
    return `${count} osób`;
  }
  return count === 1 ? "1 person" : `${count} people`;
}

function formValues(item?: SupplyItem): SupplyFormValues {
  if (!item) return EMPTY_FORM;
  return {
    name: item.name,
    category: item.category,
    onHand: String(item.onHand),
    target: String(item.target),
    unit: item.unit,
    expiresOn: item.expiresOn ?? "",
    memberId: item.memberId ?? "",
  };
}

function validation(values: SupplyFormValues, copy: ReturnType<typeof useLocalization>["messages"]["supplies"]["form"]) {
  const errors: Partial<Record<keyof SupplyFormValues, string>> = {};
  if (!values.name.trim()) errors.name = copy.nameRequired;
  if (!Number.isFinite(Number(values.onHand)) || Number(values.onHand) < 0) errors.onHand = copy.quantityInvalid;
  if (!Number.isFinite(Number(values.target)) || Number(values.target) < 0) errors.target = copy.quantityInvalid;
  return errors;
}

export function SuppliesScreen() {
  const { locale, messages } = useLocalization();
  const copy = messages.supplies;

  const loaded = useSyncExternalStore(subscribeToSupplies, getSuppliesSnapshot, getSuppliesServerSnapshot);
  const items = loaded?.items ?? null;

  const members = useSyncExternalStore(
    subscribeToMedicalProfiles,
    getMedicalProfilesSnapshot,
    getMedicalProfilesServerSnapshot,
  );

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [editingItem, setEditingItem] = useState<SupplyItem | undefined>();
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<SupplyFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof SupplyFormValues, string>>>({});
  const [status, setStatus] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const [reminders, setReminders] = useState<ReminderKind[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported");

  const readyCount = useMemo(() => items?.filter((item) => isSupplyReady(item)).length ?? 0, [items]);

  const recommendedTargets = useMemo(() => calculateRecommendedTargets(members), [members]);
  const medicalNeeds = useMemo(() => getFamilyMedicalRequirements(members, items ?? []), [members, items]);
  const recommendations = useMemo(() => householdSupplyRecommendations(members), [members]);
  const recommendationGaps = useMemo(() => recommendations.map((recommendation) => {
    const item = items?.find((candidate) => candidate.id === recommendation.itemId);
    return { item, recommendation, difference: Math.max(0, recommendation.recommendedTarget - (item?.onHand ?? 0)) };
  }).filter((gap) => gap.difference > 0), [items, recommendations]);
  const issueCounts = useMemo(() => {
    const counts = { expired: 0, "expires-soon": 0, restock: 0 };
    for (const item of items ?? []) supplyIssues(item).forEach((issue) => { counts[issue] += 1; });
    return counts;
  }, [items]);

  const isTargetsAdjusted = useMemo(() => {
    if (!items) return false;
    const waterItem = items.find((i) => i.id === "starter-water");
    if (!waterItem) return false;
    return waterItem.target === recommendedTargets.waterTargetLitres;
  }, [items, recommendedTargets.waterTargetLitres]);

  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const member of members) {
      map.set(member.id, member.fullName);
    }
    return map;
  }, [members]);

  const displayedItems = useMemo(() => {
    if (!items) return [];
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return items.filter((item) => {
      const assignedName = item.memberId ? memberNameMap.get(item.memberId) ?? "" : "";
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLocaleLowerCase().includes(normalizedQuery) ||
        assignedName.toLocaleLowerCase().includes(normalizedQuery);
      const isReady = isSupplyReady(item);
      return matchesQuery && (filter === "all" || (filter === "ready" ? isReady : !isReady));
    });
  }, [filter, items, memberNameMap, query]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    const frame = window.requestAnimationFrame(() => {
      setNotificationPermission(Notification.permission);
      try {
        const stored: unknown = JSON.parse(window.localStorage.getItem(REMINDER_STORAGE_KEY) ?? "[]");
        if (Array.isArray(stored)) setReminders(stored.filter((value): value is ReminderKind => value === "expiry" || value === "restock"));
      } catch {
        // Reminder preferences are optional and do not affect inventory access.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (notificationPermission !== "granted" || reminders.length === 0) return;
    const notificationPrefs = getNotificationPreferencesSnapshot();
    if (!notificationPrefs.supplyReminders) return;

    const hasExpiryIssue = issueCounts.expired + issueCounts["expires-soon"] > 0;
    const hasRestockIssue = issueCounts.restock > 0;
    if ((!reminders.includes("expiry") || !hasExpiryIssue) && (!reminders.includes("restock") || !hasRestockIssue)) return;
    const today = new Date().toISOString().slice(0, 10);
    if (window.localStorage.getItem(REMINDER_SENT_STORAGE_KEY) === today) return;
    const parts = [
      reminders.includes("expiry") && hasExpiryIssue ? copy.reminders.expiryNotice.replace("{count}", String(issueCounts.expired + issueCounts["expires-soon"])) : "",
      reminders.includes("restock") && hasRestockIssue ? copy.reminders.restockNotice.replace("{count}", String(issueCounts.restock)) : "",
    ].filter(Boolean);
    new Notification(copy.reminders.notificationTitle, { body: parts.join(" ") });
    window.localStorage.setItem(REMINDER_SENT_STORAGE_KEY, today);
  }, [copy.reminders, issueCounts, notificationPermission, reminders]);

  function persist(next: SupplyItem[]) {
    if (saveAllSupplies(next) === "storage-unavailable") setStorageWarning(true);
  }

  function handleAutoAdjustForFamily() {
    if (!items) return;
    const next = autoAdjustSuppliesForFamily(items, members);
    persist(next);
    setStatus(copy.familyBanner.adjustedSuccess.replace("{count}", String(members.length)));
  }

  function handleAddMedicationSupply(need: FamilyMedicalNeed) {
    setEditingItem(undefined);
    setForm({
      name: `${copy.starters["starter-medication"]}: ${need.fullName}`,
      category: "health",
      onHand: "0",
      target: "3",
      unit: "days",
      expiresOn: "",
      memberId: need.memberId,
    });
    setErrors({});
    setEditorOpen(true);
  }

  function handleAddRecommendedSupply(recommendation: SupplyRecommendation) {
    const starterId = recommendation.itemId as keyof typeof STARTER_ITEM_NAMES;
    const categoryMap: Record<string, SupplyItem["category"]> = {
      "starter-water": "water-food",
      "starter-food": "water-food",
      "starter-hygiene": "hygiene",
      "starter-first-aid": "health",
      "starter-flashlight": "power-light",
      "starter-power": "power-light",
    };
    setEditingItem(undefined);
    setForm({
      name: copy.starters[starterId] ?? STARTER_ITEM_NAMES[starterId] ?? recommendation.itemId,
      category: categoryMap[recommendation.itemId] ?? "other",
      onHand: "0",
      target: String(recommendation.recommendedTarget),
      unit: recommendation.unit,
      expiresOn: "",
      memberId: "",
    });
    setErrors({});
    setEditorOpen(true);
  }

  function toggleAttentionFilter() {
    setFilter((current) => {
      const next = current === "attention" ? "all" : "attention";
      setStatus(copy.filters[next]);
      return next;
    });
  }

  async function enableReminders() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      const defaults: ReminderKind[] = ["expiry", "restock"];
      setReminders(defaults);
      window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(defaults));
      setStatus(copy.reminders.enabled);
    }
  }

  function updateReminders(next: string[]) {
    const selected = next.filter((value): value is ReminderKind => value === "expiry" || value === "restock");
    setReminders(selected);
    window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(selected));
    setStatus(selected.length ? copy.reminders.updated : copy.reminders.disabled);
  }

  function openCreate() {
    setEditingItem(undefined);
    setForm(formValues());
    setErrors({});
    setEditorOpen(true);
  }

  function openEdit(item: SupplyItem) {
    setEditingItem(item);
    setForm({ ...formValues(item), name: localizedSupplyName(item, copy) });
    setErrors({});
    setEditorOpen(true);
  }

  function submitEditor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validation(form, copy.form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const input: SupplyItemInput = {
      name: form.name.trim(),
      category: form.category,
      onHand: Number(form.onHand),
      target: Number(form.target),
      unit: form.unit,
      expiresOn: form.expiresOn || null,
      memberId: form.memberId || null,
    };
    const next = editingItem
      ? items?.map((item) => item.id === editingItem.id ? updateSupplyItem(item, input) : item) ?? []
      : [...(items ?? []), createSupplyItem(input)];
    persist(next);
    setEditorOpen(false);
    setStatus(editingItem ? copy.status.updated : copy.status.added);
  }

  function removeItem() {
    if (!editingItem) return;
    deleteSupplyItem(editingItem.id);
    setDeleteOpen(false);
    setStatus(copy.status.deleted);
  }

  if (!items) {
    return (
      <main className="supplies-screen">
        <PageNavigationBar title={copy.title} />
        <div aria-live="polite" className="supplies-screen__loading" role="status">{copy.loading}</div>
      </main>
    );
  }

  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  const total = items.length;
  const attentionCount = total - readyCount;
  const progressVariant = attentionCount === 0 ? "success" : "warning";

  return (
    <main className="supplies-screen">
      <PageNavigationBar action={{ icon: Plus, label: copy.add, onClick: openCreate }} title={copy.title} />
      <div className="supplies-screen__content">
        <h1 className="sr-only">{copy.title}</h1>
        <header className="supplies-screen__intro">
          <div>
            <h2 className="type-h2">{copy.heading}</h2>
            <p className="type-body">{copy.description}</p>
          </div>
          <Button leadingIcon={Plus} onClick={openCreate}>{copy.add}</Button>
        </header>

        <Alert actionHref="https://www.gov.pl/web/poradnikbezpieczenstwa/dlugotrwaly-brak-pradu-blackout" actionLabel={copy.sourceAction} description={copy.guidance.description} title={copy.guidance.title} variant="info" />
        {(storageWarning || loaded?.issue) && <Alert description={copy.storageWarning} title={copy.storageWarningTitle} variant="warning" />}

        {total > 0 ? (
          <>
            {/* Readiness Summary */}
            <section aria-labelledby="supplies-readiness-heading" className={`supplies-summary supplies-summary--${progressVariant}`}>
              <CircularProgress label={copy.summary.progressLabel} max={total} value={readyCount} valueLabel={copy.summary.progressValue.replace("{ready}", String(readyCount)).replace("{total}", String(total))} variant={progressVariant} />
              <div className="supplies-summary__copy">
                <h2 className="type-h2" id="supplies-readiness-heading">{copy.summary.heading}</h2>
                <p className="type-h3">{copy.summary.progressValue.replace("{ready}", String(readyCount)).replace("{total}", String(total))}</p>
                <p aria-live="polite" className="type-body">{attentionCount === 0 ? copy.summary.allReady : copy.summary.needsAttention.replace("{count}", String(attentionCount))}</p>
              </div>
            </section>

            {/* Household Sizing Bar */}
            <section
              aria-labelledby="supplies-family-heading"
              className="supplies-household-bar"
            >
              <div className="supplies-household-bar__main">
                <UsersThree size={24} weight="bold" />
                <div className="supplies-household-bar__info">
                  <div className="supplies-household-bar__title-row">
                    <h2 className="type-h3 font-semibold" id="supplies-family-heading">
                      {copy.familyBanner.title}{members.length > 0 ? `: ${formatHouseholdPeople(members.length, locale)}` : ""}
                    </h2>
                    {members.length > 0 && (
                      <ul className="supplies-household-bar__avatars" aria-label={formatHouseholdPeople(members.length, locale)}>
                        {members.map((member) => (
                          <li key={member.id}>
                            <span
                              className="supplies-household-bar__avatar"
                              title={`${member.fullName} (${member.relationship || ""})`}
                            >
                              {getInitials(member.fullName)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="type-caption supplies-household-bar__formula truncate">
                    {members.length === 0 ? copy.familyBanner.noHousehold : copy.familyBanner.formula
                      .replace("{waterTarget}", String(recommendedTargets.waterTargetLitres))
                      .replace("{people}", formatPeopleCount(members.length, locale))}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {members.length === 0 ? (
                  <Link className="button button--secondary" href="/family">{copy.familyBanner.manageFamily}</Link>
                ) : isTargetsAdjusted ? (
                  <Tag
                    label={copy.familyBanner.alreadyAdjusted.replace("{people}", formatPeopleCount(members.length, locale))}
                    variant="success"
                  />
                ) : (
                  <Button
                    onClick={handleAutoAdjustForFamily}
                    variant="secondary"
                    leadingIcon={UsersThree}
                  >
                    {copy.familyBanner.autoAdjustAction.replace("{people}", formatPeopleCount(members.length, locale))}
                  </Button>
                )}
              </div>
            </section>

            {/* Unassigned Prescription Alert */}
            {medicalNeeds.some((need) => !need.hasAssignedSupply) && (
              <section aria-label={copy.familyBanner.prescriptionsAlert} className="supplies-prescriptions-bar type-caption">
                <div className="supplies-prescriptions-bar__main">
                  <FirstAidKit size={20} weight="bold" />
                  <span>
                    <strong className="font-semibold">{copy.familyBanner.prescriptionsAlert}</strong>{" "}
                    {medicalNeeds
                      .filter((n) => !n.hasAssignedSupply)
                      .map((n) => `${n.fullName} (${n.medications})`)
                      .join(", ")}
                  </span>
                </div>
                <div className="supplies-prescriptions-bar__actions">
                  {medicalNeeds
                    .filter((n) => !n.hasAssignedSupply)
                    .map((need) => (
                      <Button
                        key={need.memberId}
                        variant="tertiary"
                        onClick={() => handleAddMedicationSupply(need)}
                      >
                        + {copy.familyBanner.addMedicationFor.replace("{name}", need.fullName.split(" ")[0])}
                      </Button>
                    ))}
                </div>
              </section>
            )}

            {/* Maintenance & Reminders Hub */}
            <div className="supplies-maintenance-hub">
              {/* Maintenance Checks Card */}
              <section aria-labelledby="supplies-maintenance-heading" className="supplies-card supplies-maintenance-card">
                <div className="supplies-card__header">
                  <div className="supplies-card__header-title">
                    <ShieldCheck aria-hidden="true" size={24} weight="bold" />
                    <div>
                      <h2 className="type-h3 font-semibold" id="supplies-maintenance-heading">{copy.maintenance.heading}</h2>
                      <p className="type-caption">{copy.maintenance.description}</p>
                    </div>
                  </div>
                </div>

                <div aria-label={copy.maintenance.issueSummary} className="supplies-maintenance__issues" role="group">
                  <button
                    type="button"
                    className={`supplies-issue-chip ${filter === "attention" ? "supplies-issue-chip--active" : ""} ${issueCounts.expired > 0 ? "supplies-issue-chip--danger" : ""}`}
                    onClick={toggleAttentionFilter}
                    title={copy.filters.attention}
                  >
                    <WarningCircle size={16} weight="bold" />
                    <span>{copy.maintenance.expired.replace("{count}", String(issueCounts.expired))}</span>
                  </button>
                  <button
                    type="button"
                    className={`supplies-issue-chip ${filter === "attention" ? "supplies-issue-chip--active" : ""} ${issueCounts["expires-soon"] > 0 ? "supplies-issue-chip--warning" : ""}`}
                    onClick={toggleAttentionFilter}
                    title={copy.filters.attention}
                  >
                    <Clock size={16} weight="bold" />
                    <span>{copy.maintenance.expiresSoon.replace("{count}", String(issueCounts["expires-soon"]))}</span>
                  </button>
                  <button
                    type="button"
                    className={`supplies-issue-chip ${filter === "attention" ? "supplies-issue-chip--active" : ""} ${issueCounts.restock > 0 ? "supplies-issue-chip--warning" : ""}`}
                    onClick={toggleAttentionFilter}
                    title={copy.filters.attention}
                  >
                    <Package size={16} weight="bold" />
                    <span>{copy.maintenance.restock.replace("{count}", String(issueCounts.restock))}</span>
                  </button>
                </div>

                {members.length === 0 ? (
                  <Alert description={copy.maintenance.noHouseholdDescription} title={copy.maintenance.noHouseholdTitle} variant="info" />
                ) : (
                  <div className="supplies-maintenance__gaps-section">
                    <div className="supplies-maintenance__basis">
                      <UsersThree size={16} weight="bold" />
                      <p className="type-caption">{copy.maintenance.householdBasis.replace("{count}", formatHouseholdPeople(members.length, locale))}</p>
                    </div>
                    {recommendationGaps.length > 0 ? (
                      <ul className="supplies-gap-list">
                        {recommendationGaps.map(({ difference, item, recommendation }) => {
                          const IconComponent = starterIcon(recommendation.itemId);
                          const name = item ? localizedSupplyName(item, copy) : (copy.starters[recommendation.itemId as keyof typeof copy.starters] ?? recommendation.itemId);
                          return (
                            <li key={recommendation.itemId} className="supplies-gap-item">
                              <div className="supplies-gap-item__info">
                                <span className="supplies-gap-item__icon">
                                  <IconComponent size={20} weight="bold" />
                                </span>
                                <div>
                                  <p className="supplies-gap-item__name">{name}</p>
                                  <p className="supplies-gap-item__detail type-caption">
                                    {copy.maintenance.gapTargetInfo
                                      .replace("{target}", formatter.format(recommendation.recommendedTarget))
                                      .replace("{current}", formatter.format(item?.onHand ?? 0))
                                      .replace("{unit}", copy.units[item?.unit ?? recommendation.unit])}
                                  </p>
                                </div>
                              </div>
                              <div className="supplies-gap-item__actions">
                                <Tag
                                  label={copy.maintenance.gapShortage
                                    .replace("{amount}", formatter.format(difference))
                                    .replace("{unit}", copy.units[item?.unit ?? recommendation.unit])}
                                  variant="warning"
                                />
                                <Button
                                  variant="tertiary"
                                  onClick={() => item ? openEdit(item) : handleAddRecommendedSupply(recommendation)}
                                >
                                  {item ? copy.maintenance.adjustItem : copy.maintenance.addItem}
                                </Button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="supplies-maintenance__all-good">
                        <CheckCircle size={20} weight="fill" />
                        <p className="type-body">{copy.maintenance.noGaps}</p>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Reminders Card */}
              <section aria-labelledby="supplies-reminders-heading" className="supplies-card supplies-reminders-card">
                <div className="supplies-card__header">
                  <div className="supplies-card__header-title">
                    <Bell aria-hidden="true" size={24} weight="bold" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="type-h3 font-semibold" id="supplies-reminders-heading">{copy.reminders.heading}</h2>
                        <Tag
                          label={
                            notificationPermission === "granted" && reminders.length > 0
                              ? copy.reminders.statusActive
                              : notificationPermission === "denied"
                              ? copy.reminders.statusBlocked
                              : copy.reminders.statusDisabled
                          }
                          variant={
                            notificationPermission === "granted" && reminders.length > 0
                              ? "success"
                              : notificationPermission === "denied"
                              ? "danger"
                              : "neutral"
                          }
                        />
                      </div>
                      <p className="type-caption">{copy.reminders.description}</p>
                    </div>
                  </div>
                </div>

                <div className="supplies-reminders__body">
                  {notificationPermission === "unsupported" ? (
                    <p className="type-caption text-[var(--content-muted)]">{copy.reminders.unsupported}</p>
                  ) : notificationPermission === "denied" ? (
                    <Alert description={copy.reminders.deniedDescription} title={copy.reminders.deniedTitle} variant="warning" />
                  ) : notificationPermission !== "granted" ? (
                    <div className="supplies-reminders__action-prompt">
                      <Button
                        leadingIcon={Bell}
                        onClick={() => { void enableReminders(); }}
                        variant="secondary"
                      >
                        {copy.reminders.enable}
                      </Button>
                    </div>
                  ) : (
                    <div className="supplies-reminders__preferences">
                      <CheckboxGroup
                        label={copy.reminders.preferencesLabel}
                        name="supply-reminders"
                        onValueChange={updateReminders}
                        options={[
                          { value: "expiry", label: copy.reminders.expiry },
                          { value: "restock", label: copy.reminders.restock },
                        ]}
                        value={reminders}
                      />
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        ) : (
          <section aria-labelledby="supplies-empty-heading" className="supplies-empty-state">
            <WarningCircle aria-hidden="true" size={28} weight="bold" />
            <div>
              <h2 className="type-h2" id="supplies-empty-heading">{copy.empty.title}</h2>
              <p className="type-body">{copy.empty.description}</p>
              <Button leadingIcon={Plus} onClick={openCreate}>{copy.empty.action}</Button>
            </div>
          </section>
        )}

        {total > 0 && <section aria-labelledby="supplies-list-heading" className="supplies-inventory">
          <div className="supplies-inventory__heading">
            <div>
              <h2 className="type-h2" id="supplies-list-heading">{copy.inventoryHeading}</h2>
              <p className="type-caption">{copy.inventoryDescription}</p>
            </div>
            <span className="type-caption">{copy.results.replace("{count}", String(displayedItems.length))}</span>
          </div>
          <div className="supplies-filters">
            <SearchField clearLabel={copy.clearSearch} label={copy.search} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} value={query} />
            <SelectField label={copy.filterLabel} onChange={(event) => setFilter(event.target.value as StatusFilter)} options={[
              { value: "all", label: copy.filters.all },
              { value: "attention", label: copy.filters.attention },
              { value: "ready", label: copy.filters.ready },
            ]} value={filter} />
          </div>
          {displayedItems.length ? <ul className="supplies-list">
            {displayedItems.map((item) => (
              <SupplyRow
                assignedMemberName={item.memberId ? memberNameMap.get(item.memberId) : undefined}
                categoryLabel={copy.categories[item.category]}
                copy={copy}
                formatter={formatter}
                item={item}
                key={item.id}
                name={localizedSupplyName(item, copy)}
                onDelete={() => { setEditingItem(item); setDeleteOpen(true); }}
                onEdit={() => openEdit(item)}
              />
            ))}
          </ul> : <p className="supplies-list__empty" role="status">{copy.noMatches}</p>}
        </section>}
      </div>

      <p aria-live="polite" className="sr-only" role="status">{status}</p>
      <Dialog closeLabel={copy.closeDialog} description={copy.form.description} onOpenChange={setEditorOpen} open={isEditorOpen} title={editingItem ? copy.form.editTitle : copy.form.addTitle}>
        <form className="supplies-form" onSubmit={submitEditor}>
          <TextField autoFocus error={errors.name} label={copy.form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required value={form.name} />
          <SelectField label={copy.form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as SupplyItem["category"] }))} options={SUPPLY_CATEGORIES.map((category) => ({ value: category, label: copy.categories[category] }))} value={form.category} />

          {members.length > 0 && (
            <SelectField
              label={copy.form.assignedTo}
              onChange={(event) => setForm((current) => ({ ...current, memberId: event.target.value }))}
              options={[
                { value: "", label: copy.form.wholeHousehold },
                ...members.map((member) => ({
                  value: member.id,
                  label: `${member.fullName} (${member.relationship || "—"})`,
                })),
              ]}
              value={form.memberId}
            />
          )}

          <div className="supplies-form__quantities">
            <TextField error={errors.onHand} inputMode="decimal" label={copy.form.onHand} min="0" onChange={(event) => setForm((current) => ({ ...current, onHand: event.target.value }))} required step="0.01" type="number" value={form.onHand} />
            <TextField error={errors.target} inputMode="decimal" label={copy.form.target} min="0" onChange={(event) => setForm((current) => ({ ...current, target: event.target.value }))} required step="0.01" type="number" value={form.target} />
            <SelectField label={copy.form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value as SupplyItem["unit"] }))} options={SUPPLY_UNITS.map((unit) => ({ value: unit, label: copy.units[unit] }))} value={form.unit} />
          </div>
          <DateField label={copy.form.expiresOn} onChange={(event) => setForm((current) => ({ ...current, expiresOn: event.target.value }))} optional value={form.expiresOn} />
          <div className="dialog__actions">
            <Button onClick={() => setEditorOpen(false)} variant="secondary">{copy.cancel}</Button>
            <Button type="submit">{editingItem ? copy.save : copy.add}</Button>
          </div>
        </form>
      </Dialog>

      <Dialog closeLabel={copy.closeDialog} description={copy.delete.description.replace("{name}", editingItem ? localizedSupplyName(editingItem, copy) : "")} onOpenChange={setDeleteOpen} open={isDeleteOpen} title={copy.delete.title}>
        <div className="dialog__actions">
          <Button onClick={() => setDeleteOpen(false)} variant="secondary">{copy.cancel}</Button>
          <Button onClick={removeItem} variant="destructive">{copy.delete.confirm}</Button>
        </div>
      </Dialog>
    </main>
  );
}

function SupplyRow({
  assignedMemberName,
  categoryLabel,
  copy,
  formatter,
  item,
  name,
  onDelete,
  onEdit,
}: {
  assignedMemberName?: string;
  categoryLabel: string;
  copy: ReturnType<typeof useLocalization>["messages"]["supplies"];
  formatter: Intl.NumberFormat;
  item: SupplyItem;
  name: string;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const issues = supplyIssues(item);
  const tags = issues.length ? issues : ["ready" as const];
  return <li>
    <article className="supply-row">
      <div className="supply-row__main">
        <div>
          <h3 className="type-h3">{name}</h3>
          <p className="type-caption">
            {categoryLabel}
            {assignedMemberName && (
              <span className="ml-1.5 font-medium text-[var(--accent-default)]">
                · {copy.assignedToTag.replace("{name}", assignedMemberName)}
              </span>
            )}
          </p>
        </div>
        <p className="supply-row__quantity">{copy.quantity.replace("{onHand}", formatter.format(item.onHand)).replace("{target}", formatter.format(item.target)).replace("{unit}", copy.units[item.unit])}</p>
        {item.expiresOn && <p className="type-caption">{copy.expiresOn.replace("{date}", new Intl.DateTimeFormat(formatter.resolvedOptions().locale, { dateStyle: "medium" }).format(new Date(`${item.expiresOn}T00:00:00`)))}</p>}
        <div aria-label={copy.itemStatus} className="supply-row__tags">
          {tags.map((issue) => <Tag key={issue} label={issue === "ready" ? copy.status.ready : copy.status[issue as InventoryIssue]} variant={tagVariant(issue)} />)}
        </div>
      </div>
      <div className="supply-row__actions">
        <IconButton icon={PencilSimple} label={copy.edit.replace("{name}", name)} onClick={onEdit} variant="tertiary" />
        <IconButton icon={Trash} label={copy.delete.action.replace("{name}", name)} onClick={onDelete} variant="tertiary" />
      </div>
    </article>
  </li>;
}

function tagVariant(status: InventoryIssue | "ready"): TagVariant {
  if (status === "ready") return "success";
  if (status === "expired") return "danger";
  return "warning";
}

function localizedSupplyName(item: SupplyItem, copy: ReturnType<typeof useLocalization>["messages"]["supplies"]) {
  const starterId = item.id as keyof typeof STARTER_ITEM_NAMES;
  return STARTER_ITEM_NAMES[starterId] === item.name ? copy.starters[starterId] : item.name;
}

function starterIcon(itemId: string) {
  switch (itemId) {
    case "starter-water":
      return Drop;
    case "starter-food":
      return Package;
    case "starter-first-aid":
    case "starter-medication":
      return FirstAidKit;
    case "starter-flashlight":
      return Flashlight;
    case "starter-power":
      return BatteryCharging;
    case "starter-hygiene":
      return Sparkle;
    default:
      return Package;
  }
}
