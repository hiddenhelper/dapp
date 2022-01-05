import { outputs } from './outputs'
import { erc20Tokens } from './erc20'

let contractAddresses = undefined

export const configKey = [
  'controllerAddress',
  'setTokenCreatorAddress',
  'issuanceModuleAddress',
  'dextfTradeModuleAddress',
  'dextfV2MigrateAddress',
  'airdropModuleAddress',
  'streamingFeeModuleAddress',
  'stakePoolAddress',
  'rewardsManagerAddress',
  'linearReleaseEscrowFactoryAddress'

]

export function fillContractAddresses() {
  contractAddresses = {}
  const keys = Object.keys(outputs)
  keys.forEach(function(key) {
    const keyAddressMap = outputs[key]
    const deploymentName = key

    contractAddresses[deploymentName] = keyAddressMap.addresses
  })
  // console.log('contractAddresses:', contractAddresses)
}

export function getContractAddress(deploymentName, contractName) {
  // console.log(deploymentName)
  if (!contractAddresses) {
    // console.log('please call function fillContractAddresses')
    throw 'please call function fillContractAddresses'
  }
  if (!contractAddresses[deploymentName]) {
    throw 'unknown deploymentName ' + deploymentName
  }

  if (contractAddresses[deploymentName][contractName]) {
    return contractAddresses[deploymentName][contractName]
  } else {
    throw 'unknown contractName ' + contractName + ' for ' + deploymentName
  }
}

export function getHeliumConfig(deploymentName) {
  if (!contractAddresses) {
    console.error('please call function fillContractAddresses')
    throw 'please call function fillContractAddresses'
  }

  if (!contractAddresses[deploymentName]) {
    console.error('unknown deploymentName ' + deploymentName)
    throw 'unknown deploymentName ' + deploymentName
  }
  const addresses = contractAddresses[deploymentName]
  // console.log('getSetConfig -> addresses', addresses)

  const heliumConfig = {}

  configKey.forEach(function(heliumConfigKey) {
    heliumConfig[heliumConfigKey] = addresses[heliumConfigKey]
  })
  // console.log('setConfig -> setConfig', keysFromKey)
  return heliumConfig
}

export function getErc20Tokens(deploymentName) {
  if (!contractAddresses) {
    console.error('please call function fillContractAddresses')
    throw 'please call function fillContractAddresses'
  }

  if (!contractAddresses[deploymentName]) {
    console.error('unknown deploymentName ' + deploymentName)
    throw 'unknown deploymentName ' + deploymentName
  }

  const addresses = contractAddresses[deploymentName]

  const erc20TokenList = []
  erc20Tokens.forEach(function(tokenStruct) {
    const symbol = tokenStruct.symbol
    if (addresses[symbol]) {
      const newTokenStruct = { ...tokenStruct }
      newTokenStruct.address = addresses[symbol]
      erc20TokenList.push(newTokenStruct)
    }
  })

  return erc20TokenList
}
