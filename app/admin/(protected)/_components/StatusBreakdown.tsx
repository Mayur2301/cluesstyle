// PATH: app/admin/(protected)/_components/StatusBreakdown.tsx
import { ORDER_STATUS_LABELS } from "./format";

const STATUS_ORDER = ["processing", "shipped", "delivered", "cancelled"];
const STATUS_BAR_COLOR: Record<string, string> = {
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-gray-400",
};

export default function StatusBreakdown({ data }: { data: { status: string; count: number }[] }) {
  const byStatus = new Map(data.map((d) => [d.status, d.count]));
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Orders by status</h3>
      <div className="space-y-3">
        {STATUS_ORDER.map((status) => {
          const count = byStatus.get(status) ?? 0;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={status}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">{ORDER_STATUS_LABELS[status]}</span>
                <span className="text-gray-400">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${STATUS_BAR_COLOR[status]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}