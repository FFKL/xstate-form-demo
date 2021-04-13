import {timeout} from './util';
const usedEmails = ['used1@example.com', 'used2@example.com'];
const validDomain = 'example.com';

export default {
  async isEmailUsed(email) {
    return timeout(200).then(() => usedEmails.includes(email));
  },
  async isEmailDomainBanned(email) {
    return timeout(200).then(() => !email.includes(validDomain));
  },
  async register(credentials) {
    return timeout(200).then(() => { success: true });
  }
}