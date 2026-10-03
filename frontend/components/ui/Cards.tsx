import type { Icon } from "@phosphor-icons/react/lib";
import {
  ArrowRight,
  CheckCircle,
  House,
  MapPin,
  Plus,
  ShieldCheck,
} from "@phosphor-icons/react/ssr";
import { CircularProgress } from "@/components/ui/Progress";
import { Tag, type TagVariant } from "@/components/ui/Tag";

export type CardAction = {
  href: string;
  label: string;
};

type CardClassName = {
  className?: string;
};

function cardClassName(name: string, className?: string) {
  return `${name}${className ? ` ${className}` : ""}`;
}

function CardActionLink({ action, primary = false }: { action: CardAction; primary?: boolean }) {
  return (
    <a className={`card__action${primary ? " card__action--primary" : ""}`} href={action.href}>
      <span>{action.label}</span>
      <ArrowRight aria-hidden="true" size={20} weight="bold" />
    </a>
  );
}

export type ReadinessCardProps = CardClassName & {
  action: CardAction;
  completed: number;
  description?: string;
  label?: string;
  primaryAction?: boolean;
  progressSummary?: string;
  total: number;
};

export function ReadinessCard({
  action,
  className,
  completed,
  description,
  label = "Preparedness level",
  primaryAction = false,
  progressSummary,
  total,
}: ReadinessCardProps) {
  const percentage = total > 0 ? Math.round((Math.min(Math.max(completed, 0), total) / total) * 100) : 0;

  return (
    <article className={cardClassName("card card--readiness", className)}>
      <h3 className="card__title">{label}</h3>
      {description && <p className="card__description">{description}</p>}
      <div className="card__readiness-content">
        <CircularProgress label={label} max={total} value={completed} valueLabel={`${completed}/${total}`} variant="success" />
        <p className="card__readiness-percent">{progressSummary ?? `${percentage}%`}</p>
      </div>
      <CardActionLink action={action} primary={primaryAction} />
    </article>
  );
}

export type FamilyMember = {
  id: string;
  initials: string;
  name: string;
};

export type FamilyMembersCardProps = CardClassName & {
  addMemberAction: CardAction;
  manageAction: CardAction;
  members: FamilyMember[];
  membersLabel?: string;
  summary?: string;
  title?: string;
};

export function FamilyMembersCard({
  addMemberAction,
  className,
  manageAction,
  members,
  membersLabel,
  summary,
  title = "Family members",
}: FamilyMembersCardProps) {
  return (
    <article className={cardClassName("card card--family-members", className)}>
      <h3 className="card__title">{title}</h3>
      <ul className="card__avatar-list" aria-label={membersLabel ?? `${members.length} family members`}>
        {members.map((member, index) => (
          <li key={member.id}>
            <span className={`card__avatar${index === 0 ? " card__avatar--accent" : ""}`} title={member.name}>{member.initials}</span>
            <span className="sr-only">{member.name}</span>
          </li>
        ))}
        <li>
          <a aria-label={addMemberAction.label} className="card__avatar card__avatar--add" href={addMemberAction.href}>
            <Plus aria-hidden="true" size={24} weight="bold" />
          </a>
        </li>
      </ul>
      <p className="card__summary">{summary ?? `${members.length} active ${members.length === 1 ? "member" : "members"}`}</p>
      <CardActionLink action={manageAction} />
    </article>
  );
}

export type ShelterCardProps = CardClassName & {
  action: CardAction;
  address: string;
  availability?: string;
  distance: string;
  duration: string;
  tags?: { label: string; variant?: TagVariant }[];
  title: string;
  variant?: "compact" | "detailed";
};

export function ShelterCard({
  action,
  address,
  availability,
  className,
  distance,
  duration,
  tags = [],
  title,
  variant = "compact",
}: ShelterCardProps) {
  const detailed = variant === "detailed";

  return (
    <article className={cardClassName(`card card--shelter card--shelter-${variant}`, className)}>
      <div className="card__shelter-media" aria-hidden="true">
        <House size={detailed ? 44 : 36} weight="duotone" />
      </div>
      <div className="card__shelter-content">
        {availability && <span className="card__availability"><ShieldCheck aria-hidden="true" size={16} weight="bold" />{availability}</span>}
        <h3 className="card__title">{title}</h3>
        <p className="card__address">{address}</p>
        <p className="card__travel"><MapPin aria-hidden="true" size={18} weight="bold" />{distance} <span aria-hidden="true">·</span> {duration}</p>
        {tags.length > 0 && (
          <div className="card__tags">
            {tags.map((tag) => <Tag key={tag.label} label={tag.label} variant={tag.variant} />)}
          </div>
        )}
      </div>
      <CardActionLink action={action} primary={detailed} />
    </article>
  );
}

export type HouseholdResource = {
  Icon: Icon;
  id: string;
  label: string;
  value: string;
};

export type HouseholdResourcesCardProps = CardClassName & {
  action: CardAction;
  resources: HouseholdResource[];
  title?: string;
};

export function HouseholdResourcesCard({ action, className, resources, title = "Resources at home" }: HouseholdResourcesCardProps) {
  return (
    <article className={cardClassName("card card--resources", className)}>
      <h3 className="card__title">{title}</h3>
      <ul className="card__resource-list">
        {resources.map(({ Icon, id, label, value }) => (
          <li className="card__resource" key={id}>
            <Icon aria-hidden="true" size={24} weight="bold" />
            <span>{label}</span>
            <strong>{value}</strong>
          </li>
        ))}
      </ul>
      <CardActionLink action={action} />
    </article>
  );
}

export type FamilyProfileDetail = {
  label: string;
  value: string;
};

export type FamilyProfileCardProps = CardClassName & {
  details: FamilyProfileDetail[];
  initials: string;
  name: string;
  relationship: string;
  status: string;
};

export function FamilyProfileCard({ className, details, initials, name, relationship, status }: FamilyProfileCardProps) {
  return (
    <article className={cardClassName("card card--family-profile", className)}>
      <div className="card__profile-heading">
        <span aria-hidden="true" className="card__avatar card__avatar--accent">{initials}</span>
        <div>
          <h3 className="card__title">{name}</h3>
          <p className="card__relationship">{relationship}</p>
          <span className="card__status"><CheckCircle aria-hidden="true" size={16} weight="fill" />{status}</span>
        </div>
      </div>
      <dl className="card__details">
        {details.map((detail) => (
          <div key={detail.label}>
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
