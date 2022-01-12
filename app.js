
import express  from 'express';
import encBase64 from 'crypto-js/enc-base64';
import encUtf8 from 'crypto-js/enc-utf8';
import hex from "crypto-js/enc-hex";
import hmacSHA256 from 'crypto-js/hmac-sha256';
import { URLSearchParams } from 'url';
const app = express()
const port = 3456
const SECRET = "fjwdifhwufwhugbgf";

app.get('/discourse_sso', (req, res) => {
  let payload = req?.query?.sso;
  let hexEncodedSignature = req?.query?.sig;
  let matches = signatureMatch(payload, hexEncodedSignature);
  if (!matches) {throw new Error("The payload signature doesn't match")}

  let queryString = base64Decode(payload);

  const query = new URLSearchParams(queryString)
  /* your auth logic goes here
   * Make sure to validate the email address of the user

  */

  // post authentication
  const data = {
    nonce: query.get('nonce'),
    email: "Ahmedgagan3@gmail.com",
    external_id: 24
    // other params from https://meta.discourse.org/t/discourseconnect-official-single-sign-on-for-discourse-sso/13045
  }
  const responseQuery = new URLSearchParams(data);
  const responseQueryString = responseQuery.toString();

  const discourseUrl = query.get("return_sso_url");

  const responsePayload = base64Encode(responseQueryString);
  const hmacSHA256Payload = hmacSHA256(responsePayload, SECRET);
  const responseSigHex = hmacSHA256Payload.toString(hex)

  const redirectUrl = `${discourseUrl}?sso=${responsePayload}&sig=${responseSigHex}`;

  res.redirect(redirectUrl);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

const signatureMatch = (payload, hexEncodedSignature) => {
  let signatureMatch = hmacSHA256(payload, SECRET).toString() === hexEncodedSignature;
  return signatureMatch;
}

const base64Decode = (payload) => {
  return encUtf8.stringify(encBase64.parse(payload));
}

const base64Encode = (payload) => {
  return encBase64.stringify(encUtf8.parse(payload));
}
