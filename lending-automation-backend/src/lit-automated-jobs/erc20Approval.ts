import { bundledVincentAbility as erc20ApprovalBundledVincentAbility } from "@lit-protocol/vincent-ability-erc20-approval";
// @ts-ignore
import { getVincentAbilityClient } from "@lit-protocol/vincent-app-sdk/abilityClient";

import { delegateeSigner } from "./utils/utils";

function getErc20ApprovalToolClient() {
  return getVincentAbilityClient({
    bundledVincentAbility: erc20ApprovalBundledVincentAbility,
    ethersSigner: delegateeSigner,
  });
}

export async function addMarketApproval({
  ethAddress,
  marketAddress,
  tokenAddress,
  tokenAmount,
  decimals,
  rpcUrl,
  chainId,
}: {
  ethAddress: `0x${string}`;
  marketAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  tokenAmount: number;
  decimals: number;
  rpcUrl: string;
  chainId: number;
}): Promise<`0x${string}` | undefined> {
  console.log("Adding market approval for address:", ethAddress);
  const erc20ApprovalToolClient = getErc20ApprovalToolClient();
  // Prepare approval parameters
  const approvalParams = {
    rpcUrl: rpcUrl, // RPC URL for the network
    chainId: chainId, // Chain ID (e.g., 8453 for Base)
    spenderAddress: marketAddress, // Uniswap v3 Router on Base
    tokenAddress: tokenAddress, // WETH on Base
    tokenDecimals: decimals, // Token decimals
    tokenAmount: tokenAmount.toString(), // Amount to approve (in human-readable format)
  };
  const approvalContext = {
    delegatorPkpEthAddress: ethAddress,
  };

  // Running precheck to prevent sending approval tx if not needed or will fail
  const approvalPrecheckResult = await erc20ApprovalToolClient.precheck(
    approvalParams,
    approvalContext
  );

  console.log(approvalPrecheckResult);
  if (!approvalPrecheckResult.success) {
    throw new Error(
      `ERC20 approval tool precheck failed: ${approvalPrecheckResult}`
    );
  } else if (approvalPrecheckResult.result.alreadyApproved) {
    // No need to send tx, allowance is already at that amount
    return undefined;
  }

  // Sending approval tx
  const approvalExecutionResult = await erc20ApprovalToolClient.execute(
    approvalParams,
    approvalContext
  );
  if (!approvalExecutionResult.success) {
    throw new Error(
      `ERC20 approval tool execution failed: ${approvalExecutionResult}`
    );
  }

  return approvalExecutionResult.result.approvalTxHash as `0x${string}`;
}
