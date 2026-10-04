"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowCounterClockwise,
  Baby,
  Backpack,
  Check,
  Dog,
  Drop,
  FileText,
  FirstAidKit,
  Flashlight,
  Info,
  Package,
  PencilSimple,
  Plus,
  Printer,
  ShieldCheck,
  Sparkle,
  Trash,
  TShirt,
  User,
  Users,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { Button, IconButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SelectField, Stepper, TextField } from "@/components/ui/FormControls";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { LinearProgress } from "@/components/ui/Progress";
import { Tag } from "@/components/ui/Tag";
import {
  getMedicalProfilesServerSnapshot,
  getMedicalProfilesSnapshot,
  subscribeToMedicalProfiles,
} from "@/components/app/medical";
import {
  addCustomBackpackItem,
  calculateBackpackProgress,
  deriveFamilyComposition,
  getBackpackServerSnapshot,
  getBackpackSnapshot,
  getCompiledFamilyItems,
  removeCustomBackpackItem,
  setAllBackpackItemsPacked,
  setCompositionOverride,
  subscribeToBackpack,
  toggleBackpackItemPacked,
  type BackpackCategory,
  type CompiledBackpackItem,
  type FamilyComposition,
} from "@/components/app/backpack";

export function BackpackScreen() {
  const { locale, messages } = useLocalization();
  const copy = messages.plan.backpack;
  const customDialogIds = {
    name: useId(),
    category: useId(),
    quantity: useId(),
    unit: useId(),
    note: useId(),
  };

  const members = useSyncExternalStore(
    subscribeToMedicalProfiles,
    getMedicalProfilesSnapshot,
    getMedicalProfilesServerSnapshot,
  );

  const backpackState = useSyncExternalStore(
    subscribeToBackpack,
    getBackpackSnapshot,
    getBackpackServerSnapshot,
  );

  const [selectedCategory, setSelectedCategory] = useState<BackpackCategory | "all">("all");
  const [expandedInfoId, setExpandedInfoId] = useState<string | null>(null);
  const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Custom item form state
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<BackpackCategory>("documents");
  const [customQuantity, setCustomQuantity] = useState(1);
  const [customUnit, setCustomUnit] = useState("szt.");
  const [customNote, setCustomNote] = useState("");

  const familyComposition = useMemo(
    () => deriveFamilyComposition(members, backpackState.compositionOverride),
    [members, backpackState.compositionOverride],
  );

  const totalPeople = familyComposition.adults + familyComposition.children + familyComposition.seniors;

  const compiledItems = useMemo(
    () => getCompiledFamilyItems(familyComposition, backpackState.packedItemIds, backpackState.customItems),
    [familyComposition, backpackState.packedItemIds, backpackState.customItems],
  );

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return compiledItems;
    return compiledItems.filter((item) => item.category === selectedCategory);
  }, [compiledItems, selectedCategory]);

  const progress = useMemo(
    () => calculateBackpackProgress(compiledItems),
    [compiledItems],
  );

  function handleTogglePacked(itemId: string) {
    toggleBackpackItemPacked(itemId);
  }

  function handleMarkAll(packed: boolean) {
    setAllBackpackItemsPacked(
      compiledItems.map((item) => item.id),
      packed,
    );
  }

  function handleCompositionChange(field: keyof FamilyComposition, value: number) {
    const updated: FamilyComposition = {
      ...familyComposition,
      [field]: Math.max(field === "adults" ? 1 : 0, value),
    };
    setCompositionOverride(updated);
  }

  function handleResetComposition() {
    setCompositionOverride(null);
  }

  function handleAddCustomItem() {
    if (!customName.trim()) return;
    addCustomBackpackItem({
      name: customName.trim(),
      category: customCategory,
      quantity: customQuantity,
      unit: customUnit.trim() || "szt.",
      note: customNote.trim(),
    });
    setCustomName("");
    setCustomNote("");
    setCustomQuantity(1);
    setIsAddDialogOpen(false);
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  function toggleInfo(id: string) {
    setExpandedInfoId((current) => (current === id ? null : id));
  }

  function renderItemQuantityLabel(item: CompiledBackpackItem) {
    if (item.isCustom) {
      return `${item.calculatedQuantity} ${item.unit}`;
    }

    const isPl = locale === "pl";
    switch (item.packingType) {
      case "per_person":
        return isPl
          ? `${item.calculatedQuantity} ${item.unit} · 1 / os.`
          : `${item.calculatedQuantity} ${item.unit} · 1 / person`;
      case "per_person_scaled":
        return `${item.calculatedQuantity} ${item.unit}`;
      case "shared":
        return isPl ? "1 na rodzinę" : "1 per household";
      case "child_only":
        return isPl
          ? `${item.calculatedQuantity} ${item.unit} · dla dzieci`
          : `${item.calculatedQuantity} ${item.unit} · for children`;
      case "senior_only":
        return isPl
          ? `${item.calculatedQuantity} ${item.unit} · dla seniorów`
          : `${item.calculatedQuantity} ${item.unit} · for seniors`;
      case "pet_only":
        return isPl
          ? `${item.calculatedQuantity} ${item.unit} · dla zwierząt`
          : `${item.calculatedQuantity} ${item.unit} · for pets`;
      default:
        return `${item.calculatedQuantity} ${item.unit}`;
    }
  }

  function getItemTitleAndNote(item: CompiledBackpackItem) {
    if (item.isCustom) {
      return {
        title: item.customName || "",
        note: item.customNote || "",
      };
    }
    const itemCopy = copy.items[item.id as keyof typeof copy.items];
    if (itemCopy) {
      return {
        title: itemCopy.title,
        note: itemCopy.note,
      };
    }
    return { title: item.id, note: "" };
  }

  // Concise family pill text
  const isPl = locale === "pl";
  const familyParts: string[] = [];

  if (isPl) {
    if (familyComposition.adults > 0) {
      familyParts.push(
        `${familyComposition.adults} ${
          familyComposition.adults === 1
            ? "dorosły"
            : familyComposition.adults < 5
            ? "dorosłych"
            : "dorosłych"
        }`
      );
    }
    if (familyComposition.children > 0) {
      familyParts.push(
        `${familyComposition.children} ${
          familyComposition.children === 1
            ? "dziecko"
            : familyComposition.children < 5
            ? "dzieci"
            : "dzieci"
        }`
      );
    }
    if (familyComposition.seniors > 0) {
      familyParts.push(
        `${familyComposition.seniors} ${
          familyComposition.seniors === 1
            ? "senior"
            : familyComposition.seniors < 5
            ? "seniorów"
            : "seniorów"
        }`
      );
    }
    if (familyComposition.pets > 0) {
      familyParts.push(
        `${familyComposition.pets} ${
          familyComposition.pets === 1
            ? "zwierzę"
            : familyComposition.pets < 5
            ? "zwierzęta"
            : "zwierząt"
        }`
      );
    }
  } else {
    if (familyComposition.adults > 0) {
      familyParts.push(`${familyComposition.adults} ${familyComposition.adults === 1 ? "adult" : "adults"}`);
    }
    if (familyComposition.children > 0) {
      familyParts.push(`${familyComposition.children} ${familyComposition.children === 1 ? "child" : "children"}`);
    }
    if (familyComposition.seniors > 0) {
      familyParts.push(`${familyComposition.seniors} ${familyComposition.seniors === 1 ? "senior" : "seniors"}`);
    }
    if (familyComposition.pets > 0) {
      familyParts.push(`${familyComposition.pets} ${familyComposition.pets === 1 ? "pet" : "pets"}`);
    }
  }

  const totalCountWord = isPl
    ? totalPeople === 1
      ? "1 osoba"
      : totalPeople < 5
      ? `${totalPeople} osoby`
      : `${totalPeople} osób`
    : `${totalPeople} ${totalPeople === 1 ? "person" : "people"}`;

  const familyPillText = familyParts.length > 0 ? `${totalCountWord} (${familyParts.join(", ")})` : totalCountWord;

  const categoriesList: { id: BackpackCategory | "all"; label: string; count: number }[] = [
    { id: "all", label: copy.categories.all, count: compiledItems.length },
    {
      id: "water-food",
      label: copy.categories.waterFood,
      count: compiledItems.filter((i) => i.category === "water-food").length,
    },
    {
      id: "documents",
      label: copy.categories.documents,
      count: compiledItems.filter((i) => i.category === "documents").length,
    },
    {
      id: "health",
      label: copy.categories.health,
      count: compiledItems.filter((i) => i.category === "health").length,
    },
    {
      id: "tools-comm",
      label: copy.categories.toolsComm,
      count: compiledItems.filter((i) => i.category === "tools-comm").length,
    },
    {
      id: "clothing",
      label: copy.categories.clothing,
      count: compiledItems.filter((i) => i.category === "clothing").length,
    },
    {
      id: "hygiene",
      label: copy.categories.hygiene,
      count: compiledItems.filter((i) => i.category === "hygiene").length,
    },
    {
      id: "family-specific",
      label: copy.categories.familySpecific,
      count: compiledItems.filter((i) => i.category === "family-specific").length,
    },
  ];

  return (
    <main className="backpack-clean">
      <PageNavigationBar
        action={{
          icon: Printer,
          label: copy.actions.print,
          onClick: handlePrint,
        }}
        backHref="/plan"
        backLabel={copy.backLabel}
        title={copy.title}
      />

      <div className="backpack-clean__content">
        {/* Simple Top Header */}
        <header className="backpack-clean__header">
          <div className="flex items-center justify-between gap-4">
            <h1 className="type-h1">{copy.title}</h1>
            <Button leadingIcon={Plus} onClick={() => setIsAddDialogOpen(true)} variant="secondary">
              {copy.actions.addItem}
            </Button>
          </div>

          {/* Simple Family Bar */}
          <div className="backpack-clean__family-bar">
            <div className="flex items-center gap-2.5 text-sm text-[var(--content-secondary)] p-4">
              <UsersThree aria-hidden="true" size={20} />
              <span className="font-medium text-[var(--content-primary)]">{familyPillText}</span>
            </div>
            <button
              className="backpack-clean__edit-btn"
              onClick={() => setIsFamilyDialogOpen(true)}
              type="button"
            >
              <PencilSimple aria-hidden="true" size={14} />
              <span>{copy.family.adjustAction}</span>
            </button>
          </div>

          {/* Compact Progress Bar (single line, no duplicated headers) */}
          <div className="backpack-clean__progress-box">
            <LinearProgress
              label={copy.progress.summary.replace("{packed}", String(progress.packed)).replace("{total}", String(progress.total))}
              max={progress.total}
              value={progress.packed}
              valueLabel={`${progress.percentage}%`}
              variant="success"
              className="p-4"
            />
          </div>
        </header>

        {/* Scrollable Filter Chips */}
        <nav aria-label={copy.categories.all} className="backpack-clean__filters-nav">
          <ul className="backpack-clean__filters" role="tablist">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    aria-selected={isSelected}
                    className={`backpack-clean__filter-btn${isSelected ? " backpack-clean__filter-btn--active" : ""}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    role="tab"
                    type="button"
                  >
                    <span className="backpack-clean__filter-label">{cat.label}</span>
                    <span className="backpack-clean__filter-count">{cat.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bulk Action Links */}
        <div className="backpack-clean__bulk-bar">
          <span>
            {filteredItems.length}{" "}
            {isPl
              ? filteredItems.length === 1
                ? "pozycja na liście"
                : filteredItems.length < 5
                ? "pozycje na liście"
                : "pozycji na liście"
              : filteredItems.length === 1
              ? "item in list"
              : "items in list"}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="backpack-clean__bulk-link"
              onClick={() => handleMarkAll(true)}
              type="button"
            >
              {copy.actions.markAll}
            </button>
            <span aria-hidden="true" className="text-[var(--content-muted)]">·</span>
            <button
              className="backpack-clean__bulk-link"
              onClick={() => handleMarkAll(false)}
              type="button"
            >
              {copy.actions.unmarkAll}
            </button>
          </div>
        </div>

        {/* The Clean Checklist */}
        <ul className="backpack-clean__list" role="list">
          {filteredItems.map((item) => {
            const { title, note } = getItemTitleAndNote(item);
            const qtyLabel = renderItemQuantityLabel(item);
            const isInfoOpen = expandedInfoId === item.id;

            return (
              <li className="backpack-clean__item" key={item.id}>
                <div className={`backpack-clean__row${item.packed ? " backpack-clean__row--packed" : ""}`}>
                  <label className="backpack-clean__label" htmlFor={`chk-${item.id}`}>
                    <input
                      checked={item.packed}
                      className="sr-only"
                      id={`chk-${item.id}`}
                      onChange={() => handleTogglePacked(item.id)}
                      type="checkbox"
                    />
                    <span aria-hidden="true" className="backpack-clean__checkbox">
                      {item.packed && <Check size={14} weight="bold" />}
                    </span>

                    <span className="backpack-clean__title">{title}</span>
                  </label>

                  <div className="backpack-clean__meta">
                    <span className="backpack-clean__qty">{qtyLabel}</span>

                    {note && (
                      <button
                        aria-expanded={isInfoOpen}
                        aria-label={`Informacje o: ${title}`}
                        className={`backpack-clean__info-btn${isInfoOpen ? " backpack-clean__info-btn--active" : ""}`}
                        onClick={() => toggleInfo(item.id)}
                        type="button"
                      >
                        <Info size={16} />
                      </button>
                    )}

                    {item.isCustom && (
                      <button
                        aria-label={`Usuń ${title}`}
                        className="backpack-clean__delete-btn"
                        onClick={() => removeCustomBackpackItem(item.id)}
                        type="button"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Expandable Note */}
                {isInfoOpen && note && (
                  <div className="backpack-clean__tip">
                    <p>{note}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Clean minimal footer tip */}
        <footer className="backpack-clean__footer">
          <p className="text-xs text-[var(--content-muted)] text-center leading-relaxed">
            {copy.weightTip.description}
          </p>
        </footer>
      </div>

      {/* Clean Family Size Modal */}
      <Dialog
        closeLabel={copy.family.done}
        description={copy.family.description}
        onOpenChange={setIsFamilyDialogOpen}
        open={isFamilyDialogOpen}
        title={copy.family.title}
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="type-body font-medium">{copy.family.adults}</span>
              <Stepper
                id="modal-adults-stepper"
                label={copy.family.adults}
                min={1}
                onValueChange={(val) => handleCompositionChange("adults", val)}
                value={familyComposition.adults}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="type-body font-medium">{copy.family.children}</span>
              <Stepper
                id="modal-children-stepper"
                label={copy.family.children}
                min={0}
                onValueChange={(val) => handleCompositionChange("children", val)}
                value={familyComposition.children}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="type-body font-medium">{copy.family.seniors}</span>
              <Stepper
                id="modal-seniors-stepper"
                label={copy.family.seniors}
                min={0}
                onValueChange={(val) => handleCompositionChange("seniors", val)}
                value={familyComposition.seniors}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="type-body font-medium">{copy.family.pets}</span>
              <Stepper
                id="modal-pets-stepper"
                label={copy.family.pets}
                min={0}
                onValueChange={(val) => handleCompositionChange("pets", val)}
                value={familyComposition.pets}
              />
            </div>
          </div>

          <div className="dialog__actions pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
            {backpackState.compositionOverride ? (
              <Button onClick={handleResetComposition} variant="tertiary">
                {copy.family.resetOverride}
              </Button>
            ) : <div />}
            <Button onClick={() => setIsFamilyDialogOpen(false)} variant="primary">
              {copy.family.done}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Add Custom Item Dialog */}
      <Dialog
        closeLabel={copy.customItemDialog.cancel}
        onOpenChange={setIsAddDialogOpen}
        open={isAddDialogOpen}
        title={copy.customItemDialog.title}
      >
        <form
          className="backpack-custom-dialog-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddCustomItem();
          }}
        >
          <TextField
            id={customDialogIds.name}
            label={copy.customItemDialog.nameLabel}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder={copy.customItemDialog.namePlaceholder}
            required
            value={customName}
          />

          <SelectField
            id={customDialogIds.category}
            label={copy.customItemDialog.categoryLabel}
            onChange={(e) => setCustomCategory(e.target.value as BackpackCategory)}
            options={[
              { label: copy.categories.waterFood, value: "water-food" },
              { label: copy.categories.documents, value: "documents" },
              { label: copy.categories.health, value: "health" },
              { label: copy.categories.toolsComm, value: "tools-comm" },
              { label: copy.categories.clothing, value: "clothing" },
              { label: copy.categories.hygiene, value: "hygiene" },
              { label: copy.categories.familySpecific, value: "family-specific" },
            ]}
            value={customCategory}
          />

          <div className="grid grid-cols-2 gap-3">
            <Stepper
              id={customDialogIds.quantity}
              label={copy.customItemDialog.quantityLabel}
              min={1}
              onValueChange={setCustomQuantity}
              value={customQuantity}
            />
            <TextField
              id={customDialogIds.unit}
              label={copy.customItemDialog.unitLabel}
              onChange={(e) => setCustomUnit(e.target.value)}
              value={customUnit}
            />
          </div>

          <TextField
            id={customDialogIds.note}
            label={copy.customItemDialog.noteLabel}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder={copy.customItemDialog.notePlaceholder}
            value={customNote}
          />

          <div className="dialog__actions">
            <Button onClick={() => setIsAddDialogOpen(false)} type="button" variant="secondary">
              {copy.customItemDialog.cancel}
            </Button>
            <Button disabled={!customName.trim()} type="submit" variant="primary">
              {copy.customItemDialog.add}
            </Button>
          </div>
        </form>
      </Dialog>
    </main>
  );
}
