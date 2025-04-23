
// all the fake services are here
import '@mcpher/gas-fakes/main.js'

// initializes all the apps script fake environment
import { initTests } from './testinit.js'

// this code
import { Fiddler } from '../main.js'


const hexify = (c) => {
  return '#' +  c.toString(16).padStart(6, '0')
};

// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testFiddler = (pack) => {
  const { unit, fixes } = pack || initTests()

  let copyFiddler = null
  let copyAirports = null
  let airports = null
  let fiddler = null
  const toTrash = []

  const getCopy = () => {
    if (!copyAirports) {
      airports = SpreadsheetApp.openById(fixes.TEST_AIRPORTS_ID)
      copyAirports = SpreadsheetApp.create(fixes.PREFIX + airports.getName())
      const copySheet = copyAirports.insertSheet(fixes.TEST_AIRPORTS_NAME)
      const sheet = airports.getSheetByName(fixes.TEST_AIRPORTS_NAME)
      fiddler = new Fiddler(sheet)
      copyFiddler = new Fiddler(copySheet).setValues(fiddler.getValues()).dumpValues()

      if (fixes.CLEAN) {
        toTrash.push(DriveApp.getFileById(copyAirports.getId()))
      }
    }
  }


  unit.section("fiddler coloring", t => {
    getCopy()
    const coloringFiddler = new Fiddler(copyFiddler.getSheet().getParent().insertSheet("coloring sheet"))
      .setData(fiddler.getData().sort((a, b) => a.iso_country.localeCompare(b.iso_country)))

    const baseColor = 0xf0f0f1

    // get all the unique countries mentioned
    const countries = coloringFiddler.getUniqueValues("iso_country").sort()
    
    // generate a color for each country
    const colorMap = new Map(countries.map((f, i) => [f, hexify(Math.abs(baseColor - (512 * i)) % 0xffffff )]))
    // need to transpose to make rowwise
    const backgrounds = coloringFiddler.getData().map(row => colorMap.get(row.iso_country)).reduce((p, c) => {
      p.push([c])
      return p
    }, [])

    // set all columns to some background color
    const back = '#ecafc1'
    coloringFiddler.setColumnFormat({ backgrounds: back })

    // set the iso column, region, municipality format based on the country code
    const tcolumns = ['iso_country', 'iso_region', 'municipality']
    const rangeList = coloringFiddler.getRangeList(tcolumns)

    // dump all that
    coloringFiddler.dumpValues()

    // set the backgrounds of each range according to the country
    // rangelists dont have a setbackgrounds function so we have to do each range separately
    rangeList.getRanges().forEach(r => r.setBackgrounds(backgrounds))
    rangeList.getRanges().forEach(r=>t.deepEqual(r.getBackgrounds(), backgrounds))

    // now check that all is good using ss methods and a new fiddler
    const checkFiddler = new Fiddler(coloringFiddler.getSheet())
    const checkData = checkFiddler.getData()
    const checkRangeList = checkFiddler.getRangeList(tcolumns)
    checkRangeList.getRanges().forEach(r => t.true(r.getBackgrounds().every((c, i) => {
      return c[0] === colorMap.get(checkData[i].iso_country)
    })))


  })

  unit.section("testfiddler fingerprinting", t => {
    getCopy()
    t.deepEqual(fiddler.getValues(), copyFiddler.getValues(), 'copy was successful')

    const playFiddler = new Fiddler().setData([{ a: 1 }]);
    t.false(playFiddler.isDirty(), 'fingerprint tests')
    t.is(playFiddler.getFingerprint(), playFiddler.getInitialFingerprint())

    const playFiddler2 = new Fiddler().setValues(copyFiddler.getValues())
    t.false(playFiddler2.isDirty(), 'clean fingerprint tests')
    t.is(playFiddler2.getFingerprint(), playFiddler2.getInitialFingerprint())
    t.is(playFiddler2.getFingerprint(), copyFiddler.getFingerprint())

    playFiddler2.setHasHeaders(false)
    t.true(playFiddler2.isDirty(), 'dirty with headers removed')

    playFiddler2.setHasHeaders(true)
    t.false(playFiddler2.isDirty(), 'clean with headers added')

  })



  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testFiddler()
