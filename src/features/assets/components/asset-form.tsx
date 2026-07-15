"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { assetFormSchema, type AssetFormValues } from "@/features/assets/schema";
import { createAsset, updateAsset, type AssetListItem } from "@/features/assets/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

interface CategoryOption {
  id: string;
  name: string;
}

interface AssetFormProps {
  asset?: AssetListItem | null;
  categories: CategoryOption[];
  onSuccess: () => void;
  onCancel: () => void;
}

function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function AssetForm({ asset, categories, onSuccess, onCancel }: AssetFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(asset);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: asset?.name ?? "",
      logoUrl: asset?.logoUrl ?? "",
      description: asset?.description ?? "",
      categoryId: asset?.categoryId ?? "",
      vendor: asset?.vendor ?? "",
      websiteUrl: asset?.websiteUrl ?? "",
      billingUrl: asset?.billingUrl ?? "",
      dashboardUrl: asset?.dashboardUrl ?? "",
      planName: asset?.planName ?? "",
      status: asset?.status ?? "ACTIVE",
      billingCycle: asset?.billingCycle ?? "MONTHLY",
      purchaseDate: toDateInputValue(asset?.purchaseDate),
      startDate: toDateInputValue(asset?.startDate),
      renewalDate: toDateInputValue(asset?.renewalDate),
      expirationDate: toDateInputValue(asset?.expirationDate),
      autoRenew: asset?.autoRenew ?? true,
      price: asset ? (asset.priceCents ?? 0) / 100 : 0,
      currency: asset?.currency ?? "USD",
      paymentMethod: asset?.paymentMethod ?? "",
      invoiceNumber: asset?.invoiceNumber ?? "",
      purchasedFrom: asset?.purchasedFrom ?? "",
      orderId: asset?.orderId ?? "",
      licenseKey: "",
      apiKey: "",
      notes: "",
      emailUsed: asset?.emailUsed ?? "",
      username: asset?.username ?? "",
      twoFactorEnabled: asset?.twoFactorEnabled ?? false,
      recoveryEmail: asset?.recoveryEmail ?? "",
      tags: asset?.tags ?? [],
      priority: asset?.priority ?? "MEDIUM",
      isFavorite: asset?.isFavorite ?? false,
    },
  });

  const [tagInput, setTagInput] = useState("");
  const tags = watch("tags");

  function addTag() {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setValue("tags", [...tags, value]);
    }
    setTagInput("");
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      if (isEditing && asset) {
        await updateAsset(asset.id, values);
        toast.success("Asset updated");
      } else {
        await createAsset(values);
        toast.success("Asset created");
      }
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Tabs defaultValue="basics">
        <TabsList>
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="notes">Notes & tags</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="flex flex-col gap-3">
          <Field label="Name" error={errors.name?.message} required>
            <Input placeholder="e.g. ChatGPT Plus" {...register("name")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Uncategorized" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Vendor">
              <Input placeholder="OpenAI" {...register("vendor")} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={2} placeholder="What is this for?" {...register("description")} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Website" error={errors.websiteUrl?.message}>
              <Input placeholder="https://…" {...register("websiteUrl")} />
            </Field>
            <Field label="Billing page" error={errors.billingUrl?.message}>
              <Input placeholder="https://…" {...register("billingUrl")} />
            </Field>
            <Field label="Dashboard" error={errors.dashboardUrl?.message}>
              <Input placeholder="https://…" {...register("dashboardUrl")} />
            </Field>
          </div>
          <Field label="Plan name">
            <Input placeholder="Pro, Team, Business…" {...register("planName")} />
          </Field>
        </TabsContent>

        <TabsContent value="billing" className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["ACTIVE", "TRIAL", "EXPIRED", "CANCELLED", "ARCHIVED"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Billing cycle">
              <Controller
                control={control}
                name="billingCycle"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["MONTHLY", "YEARLY", "LIFETIME", "TRIAL", "FREE", "ONE_TIME", "CUSTOM"].map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price" error={errors.price?.message}>
              <Input type="number" step="0.01" min="0" {...register("price")} />
            </Field>
            <Field label="Currency">
              <Input maxLength={3} placeholder="USD" {...register("currency")} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Purchase date">
              <Input type="date" {...register("purchaseDate")} />
            </Field>
            <Field label="Start date">
              <Input type="date" {...register("startDate")} />
            </Field>
            <Field label="Renewal date">
              <Input type="date" {...register("renewalDate")} />
            </Field>
            <Field label="Expiration date">
              <Input type="date" {...register("expirationDate")} />
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label htmlFor="autoRenew" className="text-sm font-normal">
              Auto-renews
            </Label>
            <Controller
              control={control}
              name="autoRenew"
              render={({ field }) => (
                <Switch id="autoRenew" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Payment method">
              <Input placeholder="Visa •••• 4242" {...register("paymentMethod")} />
            </Field>
            <Field label="Invoice #">
              <Input {...register("invoiceNumber")} />
            </Field>
            <Field label="Purchased from">
              <Input placeholder="AppSumo, direct, …" {...register("purchasedFrom")} />
            </Field>
            <Field label="Order ID">
              <Input {...register("orderId")} />
            </Field>
          </div>
        </TabsContent>

        <TabsContent value="access" className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Secrets are encrypted (AES-256-GCM) before they&apos;re stored.
            {isEditing && " Leave blank to keep the current value."}
          </p>
          <Field label="License key">
            <Textarea
              rows={2}
              placeholder={isEditing ? "•••• (unchanged)" : "Paste license key"}
              className="font-mono text-xs"
              {...register("licenseKey")}
            />
          </Field>
          <Field label="API key">
            <Textarea
              rows={2}
              placeholder={isEditing ? "•••• (unchanged)" : "Paste API key"}
              className="font-mono text-xs"
              {...register("apiKey")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email used" error={errors.emailUsed?.message}>
              <Input type="email" {...register("emailUsed")} />
            </Field>
            <Field label="Username">
              <Input {...register("username")} />
            </Field>
            <Field label="Recovery email" error={errors.recoveryEmail?.message}>
              <Input type="email" {...register("recoveryEmail")} />
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label htmlFor="twoFactorEnabled" className="text-sm font-normal">
              Two-factor authentication enabled
            </Label>
            <Controller
              control={control}
              name="twoFactorEnabled"
              render={({ field }) => (
                <Switch
                  id="twoFactorEnabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </TabsContent>

        <TabsContent value="notes" className="flex flex-col gap-3">
          <Field label="Notes">
            <Textarea
              rows={3}
              placeholder={isEditing ? "•••• (unchanged)" : "Anything worth remembering"}
              {...register("notes")}
            />
          </Field>
          <Field label="Tags">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setValue("tags", tags.filter((t) => t !== tag))}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs hover:bg-destructive/15 hover:text-destructive"
                >
                  {tag} ×
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
          </Field>
          <Field label="Priority">
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label htmlFor="isFavorite" className="text-sm font-normal">
              Mark as favorite
            </Label>
            <Controller
              control={control}
              name="isFavorite"
              render={({ field }) => (
                <Switch id="isFavorite" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {isEditing ? "Save changes" : "Create asset"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
