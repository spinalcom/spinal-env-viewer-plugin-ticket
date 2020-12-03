var aesjs = require('aes-js');

export function decriAes(k, encryptedHex) {
  const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
  const aesCtr = new aesjs.ModeOfOperation.ctr(k, new aesjs.Counter(5));
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);
  return aesjs.utils.utf8.fromBytes(decryptedBytes);
}
export function decriB64(encryptedHex) {
  return atob(encryptedHex);
}