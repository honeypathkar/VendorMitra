import { MetricsCards } from "@/components/vendor-dashboard/metrics-cards";
import { VoiceOrdering } from "@/components/vendor-dashboard/voice-ordering";
import { RecentOrders } from "@/components/vendor-dashboard/recent-orders";
import { NearbySuppliers } from "@/components/vendor-dashboard/nearby-supplier";

interface OverviewTabProps {
  stats: any;
  isRecording: boolean;
  voiceOrder: string;
  startVoiceRecording: () => void;
  processVoiceOrder: () => void;
  setVoiceOrder: (order: string) => void;
  orders: any[];
  suppliers: any[];
}

export function OverviewTab({
  stats,
  isRecording,
  voiceOrder,
  startVoiceRecording,
  processVoiceOrder,
  setVoiceOrder,
  orders,
  suppliers,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <MetricsCards stats={stats} />

      <VoiceOrdering
        isRecording={isRecording}
        voiceOrder={voiceOrder}
        startVoiceRecording={startVoiceRecording}
        processVoiceOrder={processVoiceOrder}
        setVoiceOrder={setVoiceOrder}
      />

      <RecentOrders orders={orders} />

      <NearbySuppliers suppliers={suppliers} />
    </div>
  );
}
