import {getDeployments} from "./deployments";

describe('Deployments', () => {
  it('should get deployments for chainId 5', async () => {
    await getDeployments(5)
  })

  it('should throw an error getting deployments for chainId 999999', async () => {
    try {
      await getDeployments(999999)
    } catch(error: any) {
      if(error.message !== "There was a problem reading the deployment file for chainId '999999'") {
        throw new Error("Unexpected error in test")
      }
    }
  })
})