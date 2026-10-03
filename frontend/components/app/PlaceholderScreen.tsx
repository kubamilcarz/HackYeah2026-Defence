type PlaceholderScreenProps = {
  description: string;
  title: string;
};

export function PlaceholderScreen({ description, title }: PlaceholderScreenProps) {
  return (
    <main className="placeholder-screen">
      <div className="placeholder-screen__content">
        <p className="type-caption placeholder-screen__eyebrow">PLAN:0</p>
        <h1 className="type-h1">{title}</h1>
        <p className="type-body placeholder-screen__description">{description}</p>
        <p className="type-caption placeholder-screen__status" role="status">Coming soon</p>
      </div>
    </main>
  );
}
