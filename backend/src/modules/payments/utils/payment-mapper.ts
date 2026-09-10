import { PaymentRecord, PaymentResponseDTO } from "../dto";

export function buildUpiDeepLink(input: {
  merchantName: string;
  upiId: string;
  amount: number;
  description?: string;
}): string {
  const params = new URLSearchParams({
    pa: input.upiId,
    pn: input.merchantName,
    am: input.amount.toFixed(2),
    cu: "INR",
  });
  if (input.description) params.set("tn", input.description);
  return `upi://pay?${params.toString()}`;
}

export function mapPaymentRecordToDTO(
  record: PaymentRecord,
  upiDeepLink?: string,
): PaymentResponseDTO {
  return {
    id: record.id,
    userId: record.user_id,
    amount: Number.parseFloat(record.amount),
    merchantName: record.merchant_name,
    upiId: record.upi_id,
    status: record.status.toUpperCase() as PaymentResponseDTO["status"],
    paymentReference: record.payment_reference,
    ...(upiDeepLink ? { upiDeepLink } : {}),
    createdAt: new Date(record.created_at).toISOString(),
    updatedAt: new Date(record.updated_at).toISOString(),
  };
}
