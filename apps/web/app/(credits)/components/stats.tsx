import { Trans } from "@kit/ui/trans";
import CreditStatCard from "./stat-card";

interface CreditStatsProps {
  availableCredits: number;
  usedCredits: number;
  purchasedCredits: number;
  expiredCredits: number;
}
const CreditStats = ({
  availableCredits,
  usedCredits,
  purchasedCredits,
  expiredCredits,
}: CreditStatsProps) => {

  const getStatusKey = (status: string, value: number) => {
    if (value > 1) return `credits:status.plural.${status}`;
    return `credits:status.singular.${status}`;
  };

  return (
    <div className="flex flex-wrap gap-6">
      <CreditStatCard
        title={<Trans i18nKey={getStatusKey("available", availableCredits)} />}
        value={availableCredits}
      />
      <CreditStatCard
        title={<Trans i18nKey={getStatusKey("used", usedCredits)} />}
        value={usedCredits}
      />
      <CreditStatCard
        title={<Trans i18nKey={getStatusKey("purchased", purchasedCredits)} />}
        value={purchasedCredits}
      />
      <CreditStatCard
        title={<Trans i18nKey={getStatusKey("expired", expiredCredits)} />}
        value={expiredCredits}
      />
    </div>
  );
};

export default CreditStats;
