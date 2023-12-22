import { env } from '@/config/environment'
import { SubstrateDeployment } from '@scio-labs/use-inkathon'

/**
 * Add or change your custom contract ids here
 * DOCS: https://github.com/scio-labs/inkathon#2-custom-contracts
 */
export enum ContractIds {
  Greeter = 'greeter',
  Insurance = 'insurance',
  Chronicle = 'chronicle',
}

export const getDeployments = async (): Promise<SubstrateDeployment[]> => {
  const networks = env.supportedChains
  const deployments = networks
    .map(async (network) => [
      {
        contractId: ContractIds.Chronicle,
        networkId: network,
        abi: await import(
          `@inkathon/contracts/deployments/${ContractIds.Chronicle}/${ContractIds.Chronicle}.json`
        ),
        address: '5Hi3JgrTMGTVckBbBmPs8nfok4VUPykgk8JjnTSbxn8Mb2iq',
      },
      {
        contractId: ContractIds.Insurance,
        networkId: network,
        abi: await import(
          `@inkathon/contracts/deployments/${ContractIds.Insurance}/${ContractIds.Insurance}.json`
        ),
        address: 'ZSxc6CVSokuMmbuHxxmrjgi1xnfNxt5FEamvKNPEeRHvrT6',
      },
    ])
    .reduce(async (acc, curr) => [...(await acc), ...(await curr)], [] as any)

  return deployments
}
