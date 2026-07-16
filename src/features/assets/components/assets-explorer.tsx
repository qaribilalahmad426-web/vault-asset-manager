"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Star,
  MoreHorizontal,
  Copy,
  Archive,
  Trash2,
  ExternalLink,
  KeyRound,
  Pencil,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import {
  getAssets,
  deleteAsset,
  archiveAsset,
  toggleFavorite,
  duplicateAsset,
  revealAssetSecret,
} from "@/features/assets/actions";
import type { AssetListItem } from "@/features/assets/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssetForm } from "@/features/assets/components/asset-form";
import { CountdownBadge } from "@/components/assets/countdown-badge";
import { formatMoney, cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

interface Category {
  id: string;
  name: string;
}

const statusTone: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  ACTIVE: "success",
  TRIAL: "warning",
  EXPIRED: "destructive",
  CANCELLED: "secondary",
  ARCHIVED: "secondary",
};

export function AssetsExplorer({
  initialAssets,
  categories,
}: {
  initialAssets: AssetListItem[];
  categories: Category[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewMode, setViewMode, assetFilters, setAssetFilters } = useUiStore();
  const { search, categoryId, status, sort } = assetFilters;

  const [assets, setAssets] = useState(initialAssets);
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetListItem | null>(null);

  // Deep-link support: /assets?new=1 or /assets?assetId=xyz opens the dialog.
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditingAsset(null);
      setDialogOpen(true);
    }
    const assetId = searchParams.get("assetId");
    if (assetId) {
      const match = assets.find((a) => a.id === assetId);
      if (match) {
        setEditingAsset(match);
        setDialogOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function refresh() {
    startTransition(async () => {
      const result = await getAssets({
        search: search || undefined,
        categoryId: categoryId !== "all" ? categoryId : undefined,
        status: status !== "all" ? (status as never) : undefined,
        sort: sort as never,
      });
      setAssets(result);
    });
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, status, sort]);

  function closeDialog() {
    setDialogOpen(false);
    setEditingAsset(null);
    router.replace("/assets");
  }

  async function handleDelete(asset: AssetListItem) {
    if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) return;
    await deleteAsset(asset.id);
    toast.success("Asset deleted");
    refresh();
  }

  async function handleArchive(asset: AssetListItem) {
    await archiveAsset(asset.id);
    toast.success("Asset archived");
    refresh();
  }

  async function handleFavorite(asset: AssetListItem) {
    await toggleFavorite(asset.id);
    refresh();
  }

  async function handleDuplicate(asset: AssetListItem) {
    await duplicateAsset(asset.id);
    toast.success("Asset duplicated");
    refresh();
  }

  async function copySecret(asset: AssetListItem, field: "licenseKey" | "apiKey", label: string) {
    const plaintext = await revealAssetSecret(asset.id, field);
    if (!plaintext) {
      toast.error(`No ${label.toLowerCase()} stored for this asset`);
      return;
    }
    await navigator.clipboard.writeText(plaintext);
    toast.success(`${label} copied to clipboard`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search name, vendor, tags…"
            className="pl-8"
            value={search}
            onChange={(e) => setAssetFilters({ search: e.target.value })}
          />
        </div>

        <Select value={categoryId} onValueChange={(v) => setAssetFilters({ categoryId: v })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => setAssetFilters({ status: v })}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["ACTIVE", "TRIAL", "EXPIRED", "CANCELLED", "ARCHIVED"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setAssetFilters({ sort: v })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="renewal_soon">Renewal soon</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="cost_high">Highest cost</SelectItem>
            <SelectItem value="cost_low">Lowest cost</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
            <SelectItem value="updated">Recently updated</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1 rounded-md border border-border p-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <List className="size-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
        </div>
      </div>

      <div className={cn("transition-opacity", isPending && "opacity-60")}>
      {assets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm font-medium">No assets match these filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing filters, or add your first asset.
          </p>
        </div>
      ) : viewMode === "table" ? (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Cost</th>
                <th className="px-4 py-2.5 font-medium">Renewal</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                  onClick={() => {
                    setEditingAsset(asset);
                    setDialogOpen(true);
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavorite(asset);
                        }}
                      >
                        <Star
                          className={`size-4 ${
                            asset.isFavorite ? "fill-warning text-warning" : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      <div className="flex flex-col">
                        <span className="font-medium">{asset.name}</span>
                        <span className="text-xs text-muted-foreground">{asset.vendor ?? "—"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {asset.category?.name ?? "Uncategorized"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusTone[asset.status] ?? "secondary"}>{asset.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {formatMoney(asset.priceCents ?? 0, asset.currency)}
                    <span className="ml-1 text-xs text-muted-foreground">
                      /{asset.billingCycle.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CountdownBadge date={asset.renewalDate} />
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <AssetActionsMenu
                      asset={asset}
                      onEdit={() => {
                        setEditingAsset(asset);
                        setDialogOpen(true);
                      }}
                      onDuplicate={() => handleDuplicate(asset)}
                      onArchive={() => handleArchive(asset)}
                      onDelete={() => handleDelete(asset)}
                      onCopySecret={copySecret}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card
              key={asset.id}
              className="cursor-pointer transition-colors hover:border-ring/50"
              onClick={() => {
                setEditingAsset(asset);
                setDialogOpen(true);
              }}
            >
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">{asset.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {asset.category?.name ?? "Uncategorized"}
                    </span>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <AssetActionsMenu
                      asset={asset}
                      onEdit={() => {
                        setEditingAsset(asset);
                        setDialogOpen(true);
                      }}
                      onDuplicate={() => handleDuplicate(asset)}
                      onArchive={() => handleArchive(asset)}
                      onDelete={() => handleDelete(asset)}
                      onCopySecret={copySecret}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={statusTone[asset.status] ?? "secondary"}>{asset.status}</Badge>
                  <span className="font-mono text-sm">
                    {formatMoney(asset.priceCents ?? 0, asset.currency)}
                  </span>
                </div>
                <CountdownBadge date={asset.renewalDate} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAsset ? "Edit asset" : "New asset"}</DialogTitle>
          </DialogHeader>
          <AssetForm
            asset={editingAsset}
            categories={categories}
            onSuccess={() => {
              closeDialog();
              refresh();
            }}
            onCancel={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssetActionsMenu({
  asset,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onCopySecret,
}: {
  asset: AssetListItem;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onCopySecret: (asset: AssetListItem, field: "licenseKey" | "apiKey", label: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil /> Edit
        </DropdownMenuItem>
        {asset.websiteUrl && (
          <DropdownMenuItem asChild>
            <a href={asset.websiteUrl} target="_blank" rel="noreferrer">
              <ExternalLink /> Open website
            </a>
          </DropdownMenuItem>
        )}
        {asset.billingUrl && (
          <DropdownMenuItem asChild>
            <a href={asset.billingUrl} target="_blank" rel="noreferrer">
              <ExternalLink /> Open billing
            </a>
          </DropdownMenuItem>
        )}
        {asset.licenseKeyEncrypted && (
          <DropdownMenuItem onClick={() => onCopySecret(asset, "licenseKey", "License key")}>
            <KeyRound /> Copy license key
          </DropdownMenuItem>
        )}
        {asset.apiKeyEncrypted && (
          <DropdownMenuItem onClick={() => onCopySecret(asset, "apiKey", "API key")}>
            <KeyRound /> Copy API key
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onArchive}>
          <Archive /> Archive
        </DropdownMenuItem>
        <DropdownMenuItem destructive onClick={onDelete}>
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
