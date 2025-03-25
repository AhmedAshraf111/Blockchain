"use strict";

// تثبيت المكتبات عبر --> npm install blind-signatures jsbn
let blindSignatures = require('blind-signatures');
let BigInteger = require('jsbn').BigInteger;
let rand = require('./rand.js');

const COPIES_REQUIRED = 10;

class SpyAgency {
  constructor() {
    this.key = blindSignatures.keyGeneration({ b: 2048 }); // إنشاء مفتاح بطول 2048 بت
  }

  // التحقق من أن `blindHash` و `blindingFactor` يتطابقان مع `hash`
  consistent(blindHash, factor, hash) {
    let n = this.key.keyPair.n;
    let e = new BigInteger(this.key.keyPair.e.toString());
    blindHash = blindHash.toString();
    let bigHash = new BigInteger(hash, 16);
    let b = bigHash.multiply(factor.modPow(e, n)).mod(n).toString();
    return blindHash === b;
  }

  // التحقق من صحة المستند
  verifyContents(blindHash, blindingFactor, originalDoc) {
    if (!originalDoc.match(/^The bearer of this signed document, .*, has full diplomatic immunity.$/)) {
      return false;
    }
    let h = blindSignatures.messageToHash(originalDoc);
    return this.consistent(blindHash, blindingFactor, h);
  }

  // التوقيع على المستندات
  signDocument(blindDocs, response) {
    if (blindDocs.length !== COPIES_REQUIRED) {
      throw new Error(`There must be ${COPIES_REQUIRED} documents, but received ${blindDocs.length}`);
    }

    let blindDocsCopy = blindDocs.slice();
    let selected = rand.nextInt(blindDocsCopy.length);
    console.log(`Agency selected ${selected}`);

    response(selected, (blindingFactors, originalDocs) => {
      blindDocsCopy.forEach((doc, i) => {
        if (i === selected) return;
        if (!this.verifyContents(blindDocsCopy[i], blindingFactors[i], originalDocs[i])) {
          throw new Error(`Document ${i} is invalid`);
        }
      });

      return blindSignatures.sign({
        blinded: blindDocsCopy[selected],
        key: this.key,
      });
    });
  }

  get n() {
    return this.key.keyPair.n.toString();
  }

  get e() {
    return this.key.keyPair.e.toString();
  }
}

exports.SpyAgency = SpyAgency;
