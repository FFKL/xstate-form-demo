import {timeout} from './util';

const usedEmails = ['samurai@javascript.samurai', 'ninja@javascript.samurai'];
const validDomain = 'javascript.samurai';

export default {
  async checkEmailUsage(email) {
    return timeout(200).then(() => ({ valid: !usedEmails.includes(email), message: 'Email is already in use' }));
  },
  async checkDomainBanStatus(email) {
    return timeout(200).then(() => {
      const valid = email.endsWith(validDomain);
      const [_, usedDomain = ''] = email.split('@');

      return { valid, message: `'${usedDomain}' was banned. You can't use it.` };
    });
  },
  async register(credentials) {
    return timeout(200).then(() => ({ success: credentials.email === `valid@${validDomain}` }));
  }
}