"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AvailabilityBadge,
  FeaturedStar,
  RiskBadge,
  VerificationBadge,
} from "@/components/collection/status";
import {
  SCORE_LABELS,
  AVAILABILITY_ZH,
  categoryLabel,
  formatCheckedAt,
  formatResponseTime,
  hostOf,
  type ResourceItem,
} from "@/lib/collection";
import { ExternalLink, Globe, LogIn, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const FREE_LEVEL_LABEL: Record<string, string> = {
  free: "免费",
  partly_free: "部分免费",
  unknown: "未知",
};

const RISK_VALUE_ZH: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
  unknown: "未知",
};

const METHOD_ZH: Record<string, string> = {
  manual: "人工检测",
  automated: "自动检测",
};

function ScoreRow({ label, value }: { label: string; value: number | undefined }) {
  if (value == null) return null;
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="flex items-center gap-2">
        <span className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={cn(
                "size-3",
                i <= value ? "fill-amber-400 text-amber-400" : "text-zinc-700"
              )}
            />
          ))}
        </span>
        <span className="w-4 text-right font-mono text-xs text-zinc-400">{value}</span>
      </span>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-zinc-500">{label}</span>
      <span className="text-right text-zinc-300">{children}</span>
    </div>
  );
}

export function ResourceDialog({
  item,
  open,
  onOpenChange,
}: {
  item: ResourceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!item) return null;

  const risks = item.risks;
  const av = item.availability;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto border-zinc-800 bg-zinc-950 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6 text-xl">
            {item.featured && <FeaturedStar className="size-4 shrink-0" />}
            <span>{item.name}</span>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
            <span>{categoryLabel(item.category)}</span>
            <span>·</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1 font-mono text-amber-400/90 underline-offset-2 hover:underline"
            >
              <Globe className="size-3" />
              {hostOf(item.url)}
              <ExternalLink className="size-3" />
            </a>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          <AvailabilityBadge
            status={av?.status ?? "unchecked"}
            httpStatus={av?.httpStatus}
          />
          <VerificationBadge status={item.verification.status} />
          <RiskBadge level={risks.copyright ?? "unknown"} />
          {item.requiresLogin && (
            <Badge
              variant="outline"
              className="border-zinc-700 bg-zinc-800/60 text-zinc-300"
            >
              <LogIn className="size-3" /> 需要登录
            </Badge>
          )}
        </div>

        <p className="text-sm leading-relaxed text-zinc-300">{item.summary}</p>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <span
                key={t}
                className="rounded bg-zinc-800/70 px-1.5 py-0.5 text-[11px] text-zinc-400"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Scores */}
          <section className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              维护者评分
            </h4>
            <div className="space-y-1.5">
              {Object.entries(SCORE_LABELS).map(([k, label]) => (
                <ScoreRow key={k} label={label} value={item.scores[k as keyof typeof item.scores]} />
              ))}
              {Object.keys(item.scores).length === 0 && (
                <p className="text-xs text-zinc-600">暂无评分</p>
              )}
            </div>
          </section>

          {/* Risk profile */}
          <section className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              风险档案（维护者自报）
            </h4>
            <div className="space-y-1.5">
              <InfoRow label="版权">{RISK_VALUE_ZH[risks.copyright ?? "unknown"] ?? risks.copyright ?? "未知"}</InfoRow>
              <InfoRow label="安全性">{RISK_VALUE_ZH[risks.safety ?? "unknown"] ?? risks.safety ?? "未知"}</InfoRow>
              <InfoRow label="隐私">{RISK_VALUE_ZH[risks.privacy ?? "unknown"] ?? risks.privacy ?? "未知"}</InfoRow>
              <InfoRow label="付费">{RISK_VALUE_ZH[risks.payment ?? "unknown"] ?? risks.payment ?? "未知"}</InfoRow>
              <InfoRow label="免费程度">
                {FREE_LEVEL_LABEL[item.freeLevel] ?? item.freeLevel}
              </InfoRow>
              <InfoRow label="地区">{item.regions.join(", ") || "—"}</InfoRow>
            </div>
          </section>
        </div>

        {/* Availability detail */}
        <section className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            每日可用性检测
          </h4>
          {av ? (
            <div className="space-y-1.5">
              <InfoRow label="状态">
                <span>{AVAILABILITY_ZH[av.status] ?? av.status}</span>
              </InfoRow>
              <InfoRow label="HTTP 状态">{av.httpStatus ?? "—"}</InfoRow>
              <InfoRow label="响应时间">{formatResponseTime(av.responseMs)}</InfoRow>
              <InfoRow label="检测时间">{formatCheckedAt(av.checkedAt)}</InfoRow>
              {av.finalUrl && av.finalUrl !== item.url && (
                <InfoRow label="重定向至">
                  <span className="break-all font-mono text-xs">{hostOf(av.finalUrl)}</span>
                </InfoRow>
              )}
              {av.error && (
                <InfoRow label="错误">
                  <span className="break-all text-rose-300">{av.error}</span>
                </InfoRow>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-600">
              该资源未纳入每日自动检测（通常是托管在 GitHub 的开源项目或工具）。
            </p>
          )}
        </section>

        {/* Verification notes */}
        <section className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            维护者验证备注
          </h4>
          <p className="text-xs leading-relaxed text-zinc-400">
            {item.verification.notes || "暂无备注。"}
          </p>
          <p className="mt-2 text-[11px] text-zinc-600">
            最后检测 {item.verification.lastChecked ?? "—"} · 方式：{" "}
            {METHOD_ZH[item.verification.method ?? ""] ?? item.verification.method ?? "—"}
          </p>
        </section>

        <Separator className="bg-zinc-800" />

        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          <p className="text-[11px] text-zinc-600">
            收录于 {item.addedAt ?? "—"} · 提交者{" "}
            {item.submittedBy === "maintainer" ? "维护者" : item.submittedBy}
          </p>
          <Button
            size="sm"
            asChild
            className="bg-amber-500 text-zinc-950 hover:bg-amber-400"
          >
            <a href={item.url} target="_blank" rel="noopener noreferrer nofollow">
              <ExternalLink className="size-3.5" />
              打开网站
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
