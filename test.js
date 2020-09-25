const otf2svg = require('./lib/')
const test = require('ava');
const fs = require('fs')
const mkdirp = require('mkdirp')
const fonteditor = require('fonteditor-core')


function testTtfConversion(path, ttfPath) {

  try{ fs.unlinkSync(ttfPath) } catch(err) {}

  let rawInput = fs.readFileSync(path)
  let fontObject = fonteditor.svg2ttfobject( rawInput.toString('utf-8') )
  let ttfBuffer = new fonteditor.TTFWriter().write(fontObject);
  fs.writeFileSync(ttfPath, Buffer.from(ttfBuffer))


  return fs.existsSync(ttfPath)
}


function createMap(arr, keyAttr, valAttr) {
  let retMap = {}
  if(arr != null) {
    for(let ai=0; ai < arr.length; ai++) {
      let key = keyAttr == null ? arr[ai] : (arr[ai])[keyAttr]
      let val = valAttr == null ? true : (arr[ai])[valAttr]
      if(key != null) {
        retMap[key] = val
      }
    }
  }
  return retMap
}


function getTruetypeCodePoints(path) {

  let codePoints = []
  try {

    let inputBuffer = fs.readFileSync(path);
    let font = fonteditor.Font.create(inputBuffer, { type: 'ttf' });
    let fontData = font.get();
    
    let badGlyphNames = createMap([ '.notdef', '.null', 'nonmarkingreturn' ])
    let fontGlyphData = fontData['glyf']
    let fontCharMap = fontData['cmap']
    let candidateCodePoints = Object.keys(fontCharMap)
    
  
    for(let ccpi=0; ccpi < candidateCodePoints.length; ccpi++) {
      let candidate = candidateCodePoints[ccpi]
      let candidateGlyphIndex = fontCharMap[ candidate ]
      let candidateName = fontGlyphData[candidateGlyphIndex]['name']
      if(badGlyphNames[candidateName] == null) {
        codePoints.push( parseInt(candidate, 10) )
      }
    }

  } catch (err) {
    debugLog("FONTEDITOR-CORE ERROR LOADING CODE POINTS: " + err);

  }

  return codePoints.sort()
}



test('BalladeContour.otf Converted Properly', async (t) => {

  let inFile = "test/BalladeContour.otf"
  let outFile = "test/output/BalladContour.svg"
  let ttfFile =  outFile.replace(/svg$/, 'ttf')

  mkdirp.sync("test/output")
  try { fs.unlinkSync(outFile) } catch(err){}
  let output = otf2svg.convertToFile(inFile, outFile)
  let ttfConversion = testTtfConversion(outFile, ttfFile);
  let codePoints = getTruetypeCodePoints(ttfFile) 
  t.is(output, outFile)
  t.is(ttfConversion, true)
  t.is(codePoints.length, 44)


});



test('SFNSDisplayCondensed-Black.otf Converted Properly', async (t) => {


  let inFile = "test/SFNSDisplayCondensed-Black.otf"
  let outFile = "test/output/SFNSDisplayCondensed-Black.svg"
  let ttfFile =  outFile.replace(/svg$/, 'ttf')

  mkdirp.sync("test/output")
  try { fs.unlinkSync(outFile) } catch(err){}
  let output = otf2svg.convertToFile(inFile, outFile)
  let ttfConversion = testTtfConversion(outFile, ttfFile);
  let codePoints = getTruetypeCodePoints(ttfFile) 
  t.is(output, outFile)
  t.is(ttfConversion, true)
  t.is(codePoints.length, 1119)


});



test('NotoSansCJKsc-Bold.otf Converted Properly', async (t) => {


  let inFile = "test/NotoSansCJKsc-Bold.otf"
  let outFile = "test/output/NotoSansCJKsc-Bold.svg"
  let ttfFile =  outFile.replace(/svg$/, 'ttf')

  mkdirp.sync("test/output")
  try { fs.unlinkSync(outFile) } catch(err){}
  let output = otf2svg.convertToFile(inFile, outFile)
  let ttfConversion = testTtfConversion(outFile, ttfFile);
  let codePoints = getTruetypeCodePoints(ttfFile)
  t.is(output, outFile)
  t.is(ttfConversion, true)
  t.is(codePoints.length, 44651)


});


test('NotoSansCJKsc-Bold.otf Converted With Subset', async (t) => {


  let inFile = "test/NotoSansCJKsc-Bold.otf"
  let outFile = "test/output/NotoSansCJKsc-Bold-subset.svg"
  let ttfFile =  outFile.replace(/svg$/, 'ttf')

  mkdirp.sync("test/output")
  try { fs.unlinkSync(outFile) } catch(err){}
  let output = otf2svg.convertToFile(inFile, outFile, [0x5b99])
  let ttfConversion = testTtfConversion(outFile, ttfFile);
  let codePoints = getTruetypeCodePoints(ttfFile)
  t.is(output, outFile)
  t.is(ttfConversion, true)
  t.is(codePoints.length, 1)


});

