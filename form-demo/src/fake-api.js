import {timeout} from './util';
const usedEmails = ['used1@example.com', 'used2@example.com'];
const validDomain = 'example.com';

export default {
  async checkEmailUsage(email) {
    return timeout(200).then(() => ({ valid: !usedEmails.includes(email), message: 'Email already used' }));
  },
  async checkDomainBanStatus(email) {
    return timeout(200).then(() => ({ valid: email.includes(validDomain), message: 'Domain banned' }));
  },
  async register(credentials) {
    return timeout(200).then(() => ({ success: credentials.email === 'success@example.com' }));
  }
}