import { PageContainer, SectionHeader } from '@/components/shared';
import { CurrencySettingsCard } from '@/features/settings/components/currency-settings-card';
import { DeliveryPricingCard } from '@/features/settings/components/delivery-pricing-card';

export default function PricingSettingsPage(): React.JSX.Element {
  return (
    <PageContainer>
      <SectionHeader
        titleKey="settings.pricingTitle"
        descriptionKey="settings.pricingDescription"
      />

      <CurrencySettingsCard />
      <DeliveryPricingCard />
    </PageContainer>
  );
}
