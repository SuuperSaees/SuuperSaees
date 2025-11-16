import { PageBody } from "@kit/ui/page";
import { loadUserWorkspace } from "~/(main)/home/(user)/_lib/server/load-user-workspace";
import { EmbedPreview } from "../components/embed-preview";

async function EmbedPage({ params }: { params: { id: string } }) {
  const { organization } = await loadUserWorkspace()
  const embeds = organization.embeds ?? []
  const embed = embeds.find((embed) => embed.id === params.id)

  if (!embed) return null
  return (
    <PageBody className="flex h-full flex-col gap-8 p-8 py-8 lg:px-8">
      <EmbedPreview embedSrc={embed.value} />
    </PageBody>
  )
}

export default EmbedPage;

