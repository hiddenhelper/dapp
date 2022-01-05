/**
 * A utility to create a connector
 */

import { HeliumConnector } from '@helium'
import { providers } from 'ethers'
import * as parseOutputs from './parseOutputs'
import { GalliumConnector } from '@gallium'

export async function createGalliumConnector(
  selectedProvider,
  selectedSigning,
  selectedDeployment
) {
  const config = parseOutputs.getHeliumConfig(selectedDeployment)
  const web3 = new providers.Web3Provider(window.ethereum)
  const accounts = await window.ethereum.request({
    method: 'eth_accounts'
  })
  window.selectedAddress = accounts[0]
  return new GalliumConnector(web3, web3.getSigner(window.selectedAddress), config)
}

/**
 * @summary create a provider accordingly to user's preferences
 *
 * @function
 * @param {String} selectedProvider - The user selected choice for RPC connection (Metamask or Web3).
 * @param {String} selectedSigning - The user selected choice for Signing (Metamask).
 * @param {String} selectedDeployment - The selected deployment
 * @returns {Provider} A web3 provider object
 */
export async function createHeliumConnector(selectedProvider, selectedSigning, selectedDeployment) {
  const config = parseOutputs.getHeliumConfig(selectedDeployment)

  const web3 = new providers.Web3Provider(window.ethereum)
  const accounts = await window.ethereum.request({
    method: 'eth_accounts'
  })
  window.selectedAddress = accounts[0]
  return new HeliumConnector(web3, web3.getSigner(window.selectedAddress), config)
}
