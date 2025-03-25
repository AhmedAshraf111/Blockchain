"use strict";

let blindSignatures = require('blind-signatures');
let { SpyAgency } = require('./spyAgency.js');

function makeDocument(coverName) {
  return `The bearer of this signed document, ${coverName}, has full diplomatic immunity.`;
}

function blind(msg, n, e) {
  return blindSignatures.blind({
    message: msg,
    N: n,
    E: e,
  });
}

function unblind(blindingFactor, sig, n) {
  return blindSignatures.unblind({
    signed: sig,
    N: n,
    r: blindingFactor,
  });
}

let agency = new SpyAgency();

let coverNames = [
  "Agent X", "Shadow", "Ghost", "Phantom", "Raven",
  "Eagle", "Nightfall", "Viper", "Wraith", "Cipher"
];

let documents = coverNames.map(name => makeDocument(name));
console.log("Documents:", documents);

let blindData = documents.map(doc => blind(doc, agency.n, agency.e));
let blindedDocs = blindData.map(data => data.blinded);
let blindingFactors = blindData.map(data => data.r);

console.log("Blinded Documents:", blindedDocs);

agency.signDocument(blindedDocs, (selected, verifyAndSign) => {
  let blindingFactorsCopy = blindingFactors.map((val, i) => (i === selected ? undefined : val));
  let originalDocsCopy = documents.map((val, i) => (i === selected ? undefined : val));

  let blindedSignature = verifyAndSign(blindingFactorsCopy, originalDocsCopy);

  let unblindedSig = unblind(blindingFactors[selected], blindedSignature, agency.n);
  console.log(`Signature for document ${selected}:`, unblindedSig);
});
