import ReferralHub from "@/components/square-pass/ReferralHub";
import PromoCodeRedemption from "@/components/square-pass/PromoCodeRedemption";

export default function SquarePassPage() {
  return (
    <div className="space-y-8">
      <PromoCodeRedemption className="max-w-3xl mx-auto" />
      <ReferralHub />
    </div>
  );
}
