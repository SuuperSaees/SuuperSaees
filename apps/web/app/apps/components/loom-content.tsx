import LoomPublicIdContainer from "node_modules/@kit/accounts/src/components/personal-account-settings/loom-public-id-container";

function LoomContent({userId, pluginId}: {userId: string, pluginId: string}) {

  return (
    <LoomPublicIdContainer userId={userId ?? ''} pluginId = {pluginId} />
  );
}

export default LoomContent;