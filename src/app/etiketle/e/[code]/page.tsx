import { Metadata } from "next";
import PublicTagView from "@/components/etiketle/PublicTagView";

export async function generateMetadata(props: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await props.params;
  const upperCode = code?.toUpperCase() || "";
  return {
    title: `Etiket #${upperCode} | Etiketle QR Takip`,
    description: "Etiketle fiziksel varlık ve QR kod bilgi görüntüleme sayfası.",
  };
}

export default async function EtiketleAliasPublicTagPage(props: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await props.params;
  return <PublicTagView codeProp={code} />;
}
