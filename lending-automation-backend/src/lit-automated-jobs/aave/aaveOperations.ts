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

export async function aaveOperation({
  ethAddress,
  asset,
  amount,
  rpcUrl,
  chain,
  operation,
}: {
  ethAddress: `0x${string}`;
  asset: `0x${string}`;
  amount: number;
  rpcUrl: string;
  chain: string;
  operation: string;
}): Promise<`0x${string}` | undefined> {
  const aaveSupplyToolClient = getAaveAbilityClient();

  const supplyParams = {
    operation: operation,
    rpcUrl: rpcUrl,
    chain: chain,
    asset: asset,
    amount: amount.toString(),
    interestRateMode: 2, // 1 for stable, 2 for variable (only for borrow operation)
  };

  const aaveSupplyContext = {
    delegatorPkpEthAddress: ethAddress,
  };

  const operationPreCheckResult = await aaveSupplyToolClient.precheck(
    supplyParams,
    aaveSupplyContext
  );

  const supplyExecutionParams = {
    operation: operation,
    chain: chain,
    asset: asset,
    amount: amount.toString(),
    interestRateMode: 2,
  };

  if (operationPreCheckResult.success) {
    const operationExecutionResult = await aaveSupplyToolClient.execute(
      supplyExecutionParams,
      aaveSupplyContext
    );

    if (!operationExecutionResult.success) {
      throw new Error(
        `Aave supply execution failed: ${operationExecutionResult.error}`
      );
    }

    console.log(operationExecutionResult, operation, "console logggg");

    return operationExecutionResult.result.txHash;
  } else {
    // Handle different types of failures
    if (operationPreCheckResult.runtimeError) {
      console.error("Runtime error:", operationPreCheckResult.runtimeError);
    }
    if (operationPreCheckResult.schemaValidationError) {
      console.error(
        "Schema validation error:",
        operationPreCheckResult.schemaValidationError
      );
    }
    if (operationPreCheckResult.result) {
      console.error(
        "Aave precheck failed:",
        operationPreCheckResult.result.error
      );
    }

    return undefined;
  }
}
