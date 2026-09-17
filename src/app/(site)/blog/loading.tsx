import { Container } from "@/components/ui/section";

/** Matches the page's section rhythm so the swap to real content is quiet. */
export default function Loading() {
  return (
    <Container className="py-16">
      <div className="animate-pulse space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded bg-surface-raised" />
          <div className="h-9 w-64 rounded bg-surface-raised" />
          <div className="h-4 w-full max-w-lg rounded bg-surface-raised" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="panel h-64 rounded-card" />
          ))}
        </div>
      </div>
    </Container>
  );
}
