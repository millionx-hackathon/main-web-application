import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { LearningAssistant } from "@/components/learning-assistant";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <LearningAssistant />
    </div>
  );
}
