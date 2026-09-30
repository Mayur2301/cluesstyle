// PATH: app/admin/(protected)/contact-messages/page.tsx
import { listContactMessages } from "@/app/lib/contact-messages";
import { formatDateTime } from "../_components/format";
import ContactMessageStatusControl from "./ContactMessageStatusControl";

const STATUS_STYLES: Record<string, string> = {
  unread: "bg-amber-50 text-amber-700 border-amber-100",
  read: "bg-blue-50 text-blue-700 border-blue-100",
  replied: "bg-green-50 text-green-700 border-green-100",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function AdminContactMessagesPage() {
  const messages = await listContactMessages();
  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Submissions from the customer-facing{" "}
            <a href="/contact-us" target="_blank" className="underline">
              /contact-us
            </a>{" "}
            form.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-3 py-1.5">
            {unreadCount} unread
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-sm text-gray-500">
          No messages yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left font-medium px-4 py-3">Contact</th>
                <th className="text-left font-medium px-4 py-3">Subject / Message</th>
                <th className="text-left font-medium px-4 py-3">Interest</th>
                <th className="text-left font-medium px-4 py-3">Received</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {messages.map((m) => (
                <tr key={m.id} className="align-top">
                  <td className="px-4 py-4 min-w-[180px]">
                    <p className="font-medium text-gray-900">{m.name}</p>
                    <a href={`mailto:${m.email}`} className="text-xs text-gray-500 hover:underline block">
                      {m.email}
                    </a>
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="text-xs text-gray-400 hover:underline block">
                        {m.phone}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-4 min-w-[260px] max-w-sm">
                    <p className="font-medium text-gray-900">{m.subject}</p>
                    <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-line line-clamp-3">{m.message}</p>
                  </td>
                  <td className="px-4 py-4 min-w-[150px]">
                    {m.service_interest && (
                      <p className="text-xs text-gray-700">{m.service_interest}</p>
                    )}
                    {m.budget_range && (
                      <p className="text-xs text-gray-400 mt-0.5">{m.budget_range}</p>
                    )}
                    {m.heard_from && (
                      <p className="text-[11px] text-gray-400 mt-0.5">via {m.heard_from}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {formatDateTime(m.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex text-xs font-medium border rounded-full px-2.5 py-1 mb-2 ${
                        STATUS_STYLES[m.status] || "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {m.status}
                    </span>
                    <ContactMessageStatusControl id={m.id} currentStatus={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}