// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios').default;

describe('GET reviews', () => {
  it('sends a basic response', async () => {
    const { data } = await axios.get('http://localhost:3000/reviews?product_id=1');
    expect(data).toBeDefined();
    expect(data.results).toBeDefined();
    expect(data.results.length).toEqual(3);
    expect(data.page).toEqual(1);
  });

  it('returns the requested amount of reviews', async () => {
    const { data } = await axios.get('http://localhost:3000/reviews?product_id=2&count=2');
    expect(data.count).toEqual(2);
    expect(data.results.length).toEqual(2);
  });

  it('paginates requests', async () => {
    const { data } = await axios.get('http://localhost:3000/reviews?product_id=2&count=2&page=2');
    expect(data.page).toEqual(2);
    expect(data.results.length).toEqual(2);
  });
});