import { bundledVincentAbility as aaveAbility } from "@lit-protocol/vincent-ability-aave";

// @ts-ignore
import { getVincentAbilityClient } from "@lit-protocol/vincent-app-sdk/abilityClient";

import { delegateeSigner } from "../utils/utils";

// Initialize the ability client
function getAaveAbilityClient() {
  return getVincentAbilityClient({
    bundledVincentAbility: aaveAbility,
    ethersSigner: delegateeSigner,
  });
}

export async function supplyToAave({
  ethAddress,
  asset,
  amount,
  rpcUrl,
  chain,
}: {
  ethAddress: `0x${string}`;
  asset: `0x${string}`;
  amount: number;
  rpcUrl: string;
  chain: string;
}): Promise<`0x${string}` | undefined> {
  const aaveSupplyToolClient = getAaveAbilityClient();

  const supplyParams = {
    operation: "supply" as const,
    rpcUrl: rpcUrl,
    chain: chain,
    asset: asset,
    amount: amount.toString(),
  };

  const aaveSupplyContext = {
    delegatorPkpEthAddress: ethAddress,
  };

  const supplyPreCheckResult = await aaveSupplyToolClient.precheck(
    supplyParams,
    aaveSupplyContext
  );

  console.log("Aave Supply Precheck Result:", supplyPreCheckResult);

  const supplyExecutionParams = {
    operation: "supply" as const,
    chain: chain,
    asset: asset,
    amount: amount.toString(),
  };

  console.log(chain, "chain in execution params");

  if (supplyPreCheckResult.success) {
    const supplyExecutionResult = await aaveSupplyToolClient.execute(
      supplyExecutionParams,
      aaveSupplyContext
    );

    if (!supplyExecutionResult.success) {
      throw new Error(
        `Aave supply execution failed: ${supplyExecutionResult.error}`
      );
    }

    return supplyExecutionResult.result.transactionHash;
  } else {
    // Handle different types of failures
    if (supplyPreCheckResult.runtimeError) {
      console.error("Runtime error:", supplyPreCheckResult.runtimeError);
    }
    if (supplyPreCheckResult.schemaValidationError) {
      console.error(
        "Schema validation error:",
        supplyPreCheckResult.schemaValidationError
      );
    }
    if (supplyPreCheckResult.result) {
      console.log("Aave precheck result details:", supplyPreCheckResult.result);
      console.error("Aave precheck failed:", supplyPreCheckResult.result.error);
    }

    return undefined;
  }
}

// export async function evmSupplyToAave({
//   ethAddress,
//   asset,
//   amount,
//   rpcUrl,
//   chain,
// }: {
//   ethAddress: `0x${string}`;
//   asset: `0x${string}`;
//   amount: number;
//   rpcUrl: string;
//   chain: string;
// }): Promise<`0x${string}` | undefined> {
//   const aaveSupplyToolClient = getAaveAbilityClient();
// }
