import {NetworkDeployment} from "./types/NetworkDeployment";

const NETWORK_PATH = "../networks/"

export async function getDeployments(chainId: number): Promise<NetworkDeployment[]> {
  try{
    return require(NETWORK_PATH + chainId + ".json")
  } catch(error) {
    throw new Error(`There was a problem reading the deployment file for chainId '${chainId}'`)
  }
}

export async function getRevocationRegistryDeployment(chainId: number): Promise<NetworkDeployment> {
  try{
    const deployments = await getDeployments(chainId)
    if(typeof deployments === 'undefined' || deployments.length === 0) {
      throw new Error(`No deployments found for chainId ${chainId}`)
    }
    const deployment = deployments.find(deployment => deployment.contractName === "RevocationRegistry")
    if(typeof deployment === 'undefined') {
      throw new Error(`No Revocation Registry deployment found for chainId ${chainId}`)
    }
    return deployment
  } catch(error) {
    throw new Error(`There was a problem reading the deployment file for chainId '${chainId}: ${error}'`)
  }
}

export async function getRevocationRegistryDeploymentAddress(chainId: number): Promise<string> {
  const registry = await getRevocationRegistryDeployment(chainId)
  if(typeof registry.address === 'undefined' || registry.address !== "") {
    throw new Error("Contract address has not been found")
  }
  return registry.address
}