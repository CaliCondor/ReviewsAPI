// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios').default;

describe('GET reviews', () => {
  it('sends a basic response', async () => {
    const { data, status } = await axios.get('http://localhost:3000/reviews?product_id=1');
    expect(status).toEqual(200);
    expect(data).toBeDefined();
    expect(data.results).toBeDefined();
    expect(data.results.length).toEqual(5);
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

describe('GET meta', () => {
  it('sends a basic response', async () => {
    const { data, status } = await axios.get('http://localhost:3000/reviews/meta?product_id=1');
    expect(status).toEqual(200);
    expect(data).toBeDefined();
    expect(data.ratings).toBeDefined();
    expect(data.recommended).toBeDefined();
    expect(data.characteristics).toBeDefined();
    expect(data.product_id).toEqual('1');
  });
});

describe('POST review', () => {
  it('posts a basic review', async () => {
    const { status } = await axios.post('http://localhost:3000/reviews?product_id=5&rating=5&summary=Hi&body=Hi my name is Gerritt&recommended=true&name=me&email=me@gmail.com&photos[]=test.com');
    expect(status).toEqual(202);
  });

  it('rejects bad requests', async () => {
    const { status, data } = await axios({
      method: 'POST',
      url: 'http://localhost:3000/reviews?product_id=5&rating=5&summary=Hi',
      validateStatus: () => true,
    });

    expect(status).toEqual(422);
    expect(data).toEqual('Error: malformed request');
  });
});

describe('PUT report', () => {
  it('reports a review', async () => {
    const { status } = await axios({
      method: 'PUT',
      url: 'http://localhost:3000/reviews/1/report'
    });

    expect(status).toEqual(204);
  });
});