import { describe, expect, it } from 'vitest';
import { addLine, itemCount, MAX_QTY, parseCart, quantityOfItem, removeLine, setQuantity, toOrderLines, type CartLineInput } from './cart';

const A = 'a'.repeat(24);
const B = 'b'.repeat(24);
const O1 = '1'.repeat(24);
const O2 = '2'.repeat(24);
const mk = (over: Partial<CartLineInput> = {}): CartLineInput => ({ menuItemId: A, optionIds: [], quantity: 1, note: '', name: 'Paneer Wrap', ...over });

describe('addLine', () => {
  it('merges the same item + same options + same note', () => {
    let c = addLine([], mk({ optionIds: [O2, O1] }));
    c = addLine(c, mk({ optionIds: [O1, O2], quantity: 2 })); // option order does not matter
    expect(c).toHaveLength(1);
    expect(c[0].quantity).toBe(3);
  });
  it('keeps different options, or a different note, as separate lines', () => {
    let c = addLine([], mk());
    c = addLine(c, mk({ optionIds: [O1] }));
    c = addLine(c, mk({ note: 'less spicy' }));
    expect(c).toHaveLength(3);
  });
  it('notes compare ignoring case and spaces', () => {
    const c = addLine(addLine([], mk({ note: 'No onion' })), mk({ note: '  no onion ' }));
    expect(c).toHaveLength(1);
  });
  it('caps quantity', () => {
    const c = addLine(addLine([], mk({ quantity: MAX_QTY })), mk({ quantity: 5 }));
    expect(c[0].quantity).toBe(MAX_QTY);
  });
});

describe('setQuantity / removeLine', () => {
  it('0 removes, others set', () => {
    const c = addLine(addLine([], mk()), mk({ menuItemId: B, name: 'Shake' }));
    expect(setQuantity(c, c[0].key, 4)[0].quantity).toBe(4);
    expect(setQuantity(c, c[0].key, 0)).toHaveLength(1);
    expect(removeLine(c, c[1].key)).toHaveLength(1);
  });
});

describe('counts', () => {
  it('sums quantities, per item across variants', () => {
    const c = addLine(addLine(addLine([], mk({ quantity: 2 })), mk({ optionIds: [O1] })), mk({ menuItemId: B, quantity: 3 }));
    expect(itemCount(c)).toBe(6);
    expect(quantityOfItem(c, A)).toBe(3);
  });
});

describe('parseCart', () => {
  it('round-trips', () => {
    const c = addLine([], mk({ optionIds: [O1], note: 'hi', quantity: 2 }));
    expect(parseCart(JSON.stringify(c))).toEqual(c);
  });
  it('survives junk', () => {
    for (const raw of [null, '', 'not json', '{}', '[1,"x",null]', JSON.stringify([{ menuItemId: 'nope', quantity: 1 }]), JSON.stringify([{ menuItemId: A, quantity: 0 }])]) {
      expect(parseCart(raw)).toEqual([]);
    }
  });
  it('drops bad option ids but keeps the line', () => {
    const c = parseCart(JSON.stringify([{ menuItemId: A, quantity: 1, optionIds: [O1, 'bad', 7], note: 5, name: 'X' }]));
    expect(c[0].optionIds).toEqual([O1]);
    expect(c[0].note).toBe('');
  });
});

describe('toOrderLines', () => {
  it('sends picks only: no prices, no names', () => {
    const body = toOrderLines(addLine([], mk({ optionIds: [O1], note: 'x', quantity: 2 })));
    expect(body).toEqual([{ menuItemId: A, quantity: 2, optionIds: [O1], note: 'x' }]);
    expect(JSON.stringify(body)).not.toMatch(/price|name/i);
  });
  it('omits empty optionIds and note', () => expect(toOrderLines(addLine([], mk()))).toEqual([{ menuItemId: A, quantity: 1 }]));
});
