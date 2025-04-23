
// all these imports 
// this is loaded by npm, but is a library on Apps Script side
import { Exports as unitExports } from '@mcpher/unit'

// all the fake services are here
import '@mcpher/gas-fakes/main.js'

export const initTests = () => {

  // on node this will have come from the imports that get stripped when mocing to gas
  // on apps script, you'll have a gas only imports file that aliases 
  // the exports from any gas libraries required
  const unit = unitExports.newUnit({
    showErrorsOnly: true
  })

  // apps script can't get from parent without access to the getresource of the parent
  if (unitExports.CodeLocator.isGas) {
    // because a GAS library cant get its caller's code
    unitExports.CodeLocator.setGetResource(ScriptApp.getResource)
    // optional - generally not needed - only necessary if you are using multiple libraries and some file sahre the same ID
    unitExports.CodeLocator.setScriptId(ScriptApp.getScriptId())
  }

  // these are fixtures to test
  // using process.env creates strings, convert to appropriate types as needed
  const fixes = {
    TEST_AIRPORTS_ID: process.env.TEST_AIRPORTS_ID,
    TEST_AIRPORTS_NAME: process.env.TEST_AIRPORTS_NAME,
    PREFIX: Drive.isFake ? "--f" : "--g",
    CLEAN: process.env.CLEAN === 'true'
  }
  // double check all is defined in process.env if on node
  if (!unitExports.CodeLocator.isGas) {
    Reflect.ownKeys(fixes).forEach(k => {
      if (!Reflect.has(process.env, k) && k !== 'PREFIX') throw new Error(`process.env.${k} value is not set`)
    })
  }

  return {
    unit,
    fixes,
    // because we want to automatically run any functions in this list if in Node
    runnables: ScriptApp.isFake ? process.argv.slice(2) : []
  }

}

