import { describe } from 'node:test';
import { test } from '../lib/alignment';


describe('aligment', () => {
    it('should be deleted when real test will be created ;)', () => {
        expect(test()).toBe("Bonjour l'univers");
    })
});