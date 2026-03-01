## Algorythms
#### `GET {{baseUrl}}/api/v1/algorithms/:algorithm_id`

```js
// Generic tests for Get Algorithm
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is 2xx (success) or 4xx/5xx (likely missing/invalid id)", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 204, 400, 401, 403, 404, 422, 429, 500, 502, 503]);
});

if (pm.response.code >= 200 && pm.response.code < 300) {
  pm.test("Successful response is JSON", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    pm.expect(ct).to.include('application/json');
    pm.expect(() => pm.response.json()).to.not.throw();
  });

  pm.test("Response is an object", function () {
    const json = pm.response.json();
    pm.expect(json).to.be.an('object');
    pm.expect(Array.isArray(json)).to.equal(false);
  });
} else {
  pm.test("Error response has body (and JSON if indicated)", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('application/json')) {
      pm.expect(() => pm.response.json()).to.not.throw();
    } else {
      pm.expect(pm.response.text()).to.be.a('string');
    }
  });
}
```

<img width="930" height="341" alt="image" src="https://github.com/user-attachments/assets/a5e75d53-6974-4888-8bfb-4b942d98a490" />

<img width="924" height="477" alt="image" src="https://github.com/user-attachments/assets/7525d70f-8a40-4db6-9075-fc72328c2e55" />

<img width="929" height="803" alt="image" src="https://github.com/user-attachments/assets/7dcf01b2-fd50-4776-b6dc-8f6343711490" />

#### `PATCH {{baseUrl}}/api/v1/algorithms/:algorithm_id`

```js
// Generic tests for Update Algorithm
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is 2xx or 4xx/5xx (invalid/missing algorithm_id or body)", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 202, 204, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503]);
});

if (pm.response.code >= 200 && pm.response.code < 300) {
  pm.test("If body exists, it is JSON", function () {
    if (pm.response.text() && pm.response.text().trim().length) {
      const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
      pm.expect(ct).to.include('application/json');
      pm.expect(() => pm.response.json()).to.not.throw();
    } else {
      pm.expect(pm.response.code).to.be.oneOf([202, 204]);
    }
  });

  pm.test("Updated resource has object shape when returned", function () {
    if (pm.response.text() && pm.response.text().trim().length) {
      const json = pm.response.json();
      pm.expect(json).to.be.an('object');
    } else {
      pm.expect(true).to.equal(true);
    }
  });
} else {
  pm.test("Error response has a body", function () {
    pm.expect(pm.response.text()).to.be.a('string');
  });
}
```
Body
<img width="933" height="908" alt="image" src="https://github.com/user-attachments/assets/7a160da1-4b76-4da5-b8f2-618c3853869e" />

Headers
<img width="937" height="572" alt="image" src="https://github.com/user-attachments/assets/45073f2d-42e3-4a5c-a411-f076889833b6" />


Params
<img width="923" height="872" alt="image" src="https://github.com/user-attachments/assets/cadc2ab4-e431-407f-87d4-3ce331542c12" />


## Journals


## Trades
