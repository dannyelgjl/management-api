import { of } from 'rxjs';

import { ResponseEnvelopeInterceptor } from './response-envelope.interceptor';

describe('ResponseEnvelopeInterceptor', () => {
  const interceptor = new ResponseEnvelopeInterceptor();
  const context = {} as never;

  async function intercept(value: unknown) {
    const next = { handle: jest.fn(() => of(value)) };
    return new Promise((resolve) => {
      interceptor.intercept(context, next).subscribe(resolve);
    });
  }

  it('wraps regular responses in a data envelope', async () => {
    await expect(intercept({ id: '1' })).resolves.toEqual({ data: { id: '1' } });
  });

  it('keeps existing data/meta envelopes untouched', async () => {
    const response = { data: [], meta: { total: 0 } };
    await expect(intercept(response)).resolves.toBe(response);
  });

  it('wraps nullish responses as null data', async () => {
    await expect(intercept(undefined)).resolves.toEqual({ data: null });
  });

  it('wraps arrays as data instead of treating them as envelopes', async () => {
    await expect(intercept([{ id: '1' }])).resolves.toEqual({
      data: [{ id: '1' }],
    });
  });
});
