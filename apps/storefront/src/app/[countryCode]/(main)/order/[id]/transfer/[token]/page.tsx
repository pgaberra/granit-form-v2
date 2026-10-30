import { Heading, Text } from "@modules/common/components/ui"
import TransferActions from "@modules/order/components/transfer-actions"
import TransferImage from "@modules/order/components/transfer-image"

export default async function TransferPage({
  params,
}: {
  params: Promise<{ id: string; token: string }>
}) {
  const { id, token } = await params

  return (
    <div className="flex flex-col gap-y-4 items-start w-2/5 mx-auto mt-10 mb-20">
      <TransferImage />
      <div className="flex flex-col gap-y-6">
        <Heading level="h1" className="text-xl text-zinc-900">
          Begäran om överföring av beställning {id}
        </Heading>
        <Text className="text-zinc-600">
          Du har fått en begäran om att överföra ägandet av din beställning ({id}).
          Om du godkänner begäran kan du bekräfta överföringen med knappen
          nedan.
        </Text>
        <div className="w-full h-px bg-zinc-200" />
        <Text className="text-zinc-600">
          Om du godkänner tar den nya ägaren över allt ansvar och alla
          behörigheter som hör till beställningen.
        </Text>
        <Text className="text-zinc-600">
          Känner du inte igen begäran, eller vill du behålla ägandet, behöver du
          inte göra något.
        </Text>
        <div className="w-full h-px bg-zinc-200" />
        <TransferActions id={id} token={token} />
      </div>
    </div>
  )
}
