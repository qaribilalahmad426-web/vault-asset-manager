import { Suspense } from "react";
import { getAssets } from "@/features/assets/actions";
import { getCategories } from "@/features/categories/actions";
import { AssetsExplorer } from "@/features/assets/components/assets-explorer";

export default async function AssetsPage() {
  const [assets, categories] = await Promise.all([getAssets({}), getCategories()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
        <p className="text-sm text-muted-foreground">
          Every tool, subscription, and license you&apos;ve added.
        </p>
      </div>

      <Suspense>
        <AssetsExplorer initialAssets={assets} categories={categories} />
      </Suspense>
    </div>
  );
}
