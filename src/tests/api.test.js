// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios').default;

describe('GET reviews', () => {
  it('sends a basic response', async () => {
    const { data } = await axios.get('http://localhost:3000/reviews?product_id=1');
    expect(data).toBeDefined();
  });
});