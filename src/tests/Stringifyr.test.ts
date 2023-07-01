import { expect } from 'chai';
import { Stringifyr } from '../lib';

describe('Stringifyr', () => {
  describe("nodeValues", () => {
    it('does not recurse infinitely', () => {
      const result = Stringifyr.nodeValues({
        "type": "text",
        "value": "You don't need to block the dev team anymore to request updates to your copy.",
      })
      expect(result).to.eql("You don't need to block the dev team anymore to request updates to your copy.")
    })
  });
})
