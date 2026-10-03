"use client";

import { useState } from "react";
import {
  CheckboxGroup,
  DateField,
  RadioGroup,
  SearchField,
  SegmentedControl,
  SelectField,
  Slider,
  Stepper,
  TextField,
} from "@/components/ui/FormControls";

const contactOptions = [
  { label: "SMS message", value: "sms" },
  { label: "Phone call", value: "call" },
  { label: "Email", value: "email" },
];

export function ControlsShowcase() {
  const [search, setSearch] = useState("First aid kit");
  const [priority, setPriority] = useState("medium");
  const [supplies, setSupplies] = useState(["water"]);
  const [view, setView] = useState("list");
  const [radius, setRadius] = useState(10);
  const [people, setPeople] = useState(2);

  return (
    <section className="mt-10" aria-labelledby="controls-heading">
      <div className="mb-4 max-w-2xl">
        <h3 className="type-h3" id="controls-heading">Controls</h3>
        <p className="type-caption mt-1 text-[var(--content-muted)]">Use native controls for dependable keyboard, assistive-technology, and mobile behavior. Labels remain visible by default; helper and error text explain the next action.</p>
      </div>
      <div className="controls-showcase">
        <TextField helperText="Use the name shown on your emergency plan." label="Full name" placeholder="Alex Morgan" />
        <TextField error="Enter a valid phone number." label="Emergency phone" type="tel" value="123" readOnly />
        <SearchField label="Search supplies" onChange={(event) => setSearch(event.target.value)} value={search} />
        <SelectField defaultValue="apartment" label="Home type" options={[{ label: "Apartment", value: "apartment" }, { label: "House", value: "house" }, { label: "Shared home", value: "shared" }]} placeholder="Choose a home type" />
        <DateField helperText="Choose the next review date for this plan." label="Plan review date" min="2026-01-01" />
        <TextField disabled label="Account number" value="Available after verification" readOnly />
        <RadioGroup label="Emergency contact method" name="contact-method" onValueChange={() => undefined} options={contactOptions} required value="sms" />
        <CheckboxGroup label="Pack these supplies" name="supplies" onValueChange={setSupplies} options={[{ label: "Water", value: "water" }, { label: "Medication", value: "medication" }, { label: "Flashlight", value: "flashlight" }]} value={supplies} />
        <SegmentedControl label="Plan view" name="plan-view" onValueChange={setView} options={[{ label: "List", value: "list" }, { label: "Map", value: "map" }, { label: "Timeline", value: "timeline" }]} value={view} />
        <Slider formatValue={(value) => `${value} km`} label="Safety radius" max={25} min={1} onValueChange={setRadius} value={radius} />
        <Stepper label="People in your household" max={12} min={1} onValueChange={setPeople} value={people} />
      </div>
    </section>
  );
}
