import type { Metadata } from "next";
import { FirstAidKit, Phone, Plus } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/Button";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";

export const metadata: Metadata = { title: "Family" };

export default function FamilyPage() {
  return (
    <main className="family-page">
      <PageNavigationBar title="Family" />
      <div className="family-page__content">
        <h1 className="sr-only">Family</h1>

        <section aria-labelledby="family-members-heading" className="family-page__section">
          <h2 className="type-h2" id="family-members-heading">Family members</h2>
          <ul aria-label="Family members" className="family-member-strip">
            <li className="family-member-strip__item">
              <button className="family-member-add" disabled type="button">
                <span aria-hidden="true" className="family-member-add__avatar"><Plus size={28} weight="bold" /></span>
                <span>Add person</span>
              </button>
            </li>
          </ul>
        </section>

        <section aria-labelledby="emergency-contacts-heading" className="family-page__section">
          <h2 className="type-h2" id="emergency-contacts-heading">Emergency contacts</h2>
          <div className="family-empty-state">
            <Phone aria-hidden="true" className="family-empty-state__icon" size={28} weight="bold" />
            <div className="family-empty-state__content">
              <h3 className="type-h3">No emergency contacts yet</h3>
              <p className="type-body">Add your first emergency contact so your household can find the right person quickly.</p>
              <Button disabled leadingIcon={Plus} variant="secondary">Add contact</Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="medical-information-heading" className="family-page__section">
          <h2 className="type-h2" id="medical-information-heading">Medical information</h2>
          <div className="family-empty-state">
            <FirstAidKit aria-hidden="true" className="family-empty-state__icon" size={28} weight="bold" />
            <div className="family-empty-state__content">
              <h3 className="type-h3">No medical information yet</h3>
              <p className="type-body">Add relevant health information for household members to keep it together with your plan.</p>
              <Button disabled leadingIcon={Plus} variant="secondary">Add medical information</Button>
              <Button disabled leadingIcon={Plus} variant="secondary">Add notes</Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
