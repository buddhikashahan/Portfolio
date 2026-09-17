/** Dashboard skeleton, sized to the overview grid. */
export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-3">
        <div className="h-8 w-56 rounded bg-surface-raised" />
        <div className="h-4 w-full max-w-md rounded bg-surface-raised" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="panel h-36 rounded-card" />
        ))}
      </div>
      <div className="panel h-72 rounded-card" />
    </div>
  );
}
