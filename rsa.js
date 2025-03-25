"use strict";

function modPow(base, exp, mod) {
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) { 
            result = (result * base) % mod;
        }
        exp = exp / 2n;
        base = (base * base) % mod;
    }
    return result;
}

function encrypt(message, pubKey) {
    return modPow(BigInt(message), BigInt(pubKey.e), BigInt(pubKey.modulus));
}

function decrypt(ciphertext, privKey) {
    return modPow(BigInt(ciphertext), BigInt(privKey.d), BigInt(privKey.modulus));
}

function sign(message, privKey) {
    return decrypt(message, privKey);
}

function verify(message, sig, pubKey) {
    let m = encrypt(sig, pubKey);
    return m === BigInt(message);
}

let mod = 33n; 
let pub = { modulus: mod, e: 3n };
let priv = { modulus: mod, d: 7n };

let m = 18;
let c = encrypt(m, pub);
console.log(`${m} encrypted returns ${c}`);

let m1 = decrypt(c, priv);
console.log(`${c} decrypted returns ${m1}`);

console.log();

m = 24;
let sig = sign(m, priv);
console.log(`${m} signed returns signature ${sig}`);

let b = verify(m, sig, pub);
console.log(`${sig} ${b ? "is" : "is not"} a valid signature for ${m}`);
