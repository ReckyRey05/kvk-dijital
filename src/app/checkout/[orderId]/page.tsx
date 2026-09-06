import { redirect } from "next/navigation";

export default async function CheckoutRedirectPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  redirect(`/teklifim-gelsin/checkout/${orderId}`);
}
