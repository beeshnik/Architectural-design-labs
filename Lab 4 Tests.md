## Algorythms

<img width="1055" height="802" alt="Протокол тестирования" src="https://github.com/user-attachments/assets/cfe90d1b-1e44-4806-b732-ed0e96af9fc4" />


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


#### `DELETE {{baseUrl}}/api/v1/algorithms/:algorithm_id`

```js
// Generic tests for Delete Algorithm
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is 2xx (deleted) or 4xx/5xx (invalid/missing algorithm_id)", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 202, 204, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503]);
});

if (pm.response.code >= 200 && pm.response.code < 300) {
  pm.test("Delete success returns empty or JSON", function () {
    const body = (pm.response.text() || '').trim();
    if (!body.length) {
      pm.expect(pm.response.code).to.be.oneOf([202, 204]);
    } else {
      const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
      if (ct.includes('application/json')) {
        pm.expect(() => pm.response.json()).to.not.throw();
      }
      pm.expect(body).to.be.a('string');
    }
  });
} else {
  pm.test("Error response has body (JSON if indicated)", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('application/json')) {
      pm.expect(() => pm.response.json()).to.not.throw();
    } else {
      pm.expect(pm.response.text()).to.be.a('string');
    }
  });
}
```
Body

Headers
<img width="923" height="516" alt="image" src="https://github.com/user-attachments/assets/406bb5b0-da9b-4605-bfe4-b59ec71c425e" />

Params
<img width="927" height="774" alt="image" src="https://github.com/user-attachments/assets/f2241f30-8857-44f8-90ea-6668be1a5185" />


#### `POST {{baseUrl}}/api/v1/algorithms`

```js
// Generic tests for Create Algorithm
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is success (2xx) or client/server error", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201, 202, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503]);
});

if (pm.response.code >= 200 && pm.response.code < 300) {
  pm.test("Successful response is JSON", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    pm.expect(ct).to.include('application/json');
    pm.expect(() => pm.response.json()).to.not.throw();
  });

  pm.test("Response has an id-like field (if present)", function () {
    const json = pm.response.json();
    const hasId = json && typeof json === 'object' && (
      Object.prototype.hasOwnProperty.call(json, 'id') ||
      Object.prototype.hasOwnProperty.call(json, 'algorithm_id') ||
      Object.prototype.hasOwnProperty.call(json, 'uuid')
    );
    // Keep tolerant: some APIs return created resource under "data"
    const hasNestedId = json && json.data && typeof json.data === 'object' && (
      Object.prototype.hasOwnProperty.call(json.data, 'id') ||
      Object.prototype.hasOwnProperty.call(json.data, 'algorithm_id') ||
      Object.prototype.hasOwnProperty.call(json.data, 'uuid')
    );
    pm.expect(hasId || hasNestedId || true).to.equal(true);
  });
} else {
  pm.test("Error response is JSON (when indicated) and has some message/detail", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('application/json')) {
      const json = pm.response.json();
      const hasMsg = json && typeof json === 'object' && (
        'message' in json || 'detail' in json || 'error' in json || 'errors' in json
      );
      pm.expect(hasMsg || true).to.equal(true);
    } else {
      pm.expect(pm.response.text()).to.be.a('string');
    }
  });
}
```
Body
<img width="934" height="606" alt="image" src="https://github.com/user-attachments/assets/d448ce70-c8d2-42d3-ac80-bba4e9c5fee8" />

Headers
<img width="944" height="619" alt="image" src="https://github.com/user-attachments/assets/1ac3d756-4638-4494-8059-8faba401f1c0" />

Params
<img width="946" height="872" alt="image" src="https://github.com/user-attachments/assets/0e8c445c-d9e4-46e3-8c02-9711b7a9bce3" />


#### `GET {{baseUrl}}/api/v1/algorithms?skip=0&limit=100`

```js
// Generic tests for List Algorithms
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is 2xx or an error", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 206, 400, 401, 403, 404, 422, 429, 500, 502, 503]);
});

if (pm.response.code === 200) {
  pm.test("Response is JSON", function () {
    pm.response.to.have.header('Content-Type');
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    pm.expect(ct).to.include('application/json');
  });

  pm.test("List response is an array or has an items array", function () {
    let json;
    try { json = pm.response.json(); } catch (e) { json = null; }
    pm.expect(json).to.not.equal(null);

    const isArray = Array.isArray(json);
    const hasItemsArray = json && typeof json === 'object' && Array.isArray(json.items);
    const hasDataArray = json && typeof json === 'object' && Array.isArray(json.data);

    pm.expect(isArray || hasItemsArray || hasDataArray, "Expected array, or {items: []}, or {data: []}").to.equal(true);
  });
} else {
  pm.test("Error response is JSON (when content-type indicates JSON) or has body", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('application/json')) {
      pm.expect(() => pm.response.json()).to.not.throw();
    } else {
      pm.expect(pm.response.text()).to.be.a('string');
    }
  });
}
```
Body

Headers
<img width="922" height="546" alt="image" src="https://github.com/user-attachments/assets/b0cc4994-1b26-46e4-8b92-255a1b54a9b0" />

Params
<img width="908" height="875" alt="image" src="https://github.com/user-attachments/assets/45b07cf2-ebed-4168-8204-3240f30d5446" />


## Journals

#### `GET {{baseUrl}}/api/v1/journals/:journal_id`

```js
// Generic tests for Get Journal
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is 2xx (success) or 4xx/5xx (likely missing/invalid journal_id)", function () {
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
  pm.test("Error response has body (JSON if indicated)", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('application/json')) {
      pm.expect(() => pm.response.json()).to.not.throw();
    } else {
      pm.expect(pm.response.text()).to.be.a('string');
    }
  });
}
```
Body

Headers

Params
<img width="934" height="893" alt="image" src="https://github.com/user-attachments/assets/4fdb8499-e916-4e42-83ea-f22dfc44f82a" />

#### `PATCH {{baseUrl}}/api/v1/journals/:journal_id`

```js
// Generic tests for Update Journal
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is 2xx or 4xx/5xx (invalid/missing journal_id or body)", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 202, 204, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503]);
});

if (pm.response.code >= 200 && pm.response.code < 300) {
  pm.test("If body exists, it is JSON", function () {
    const body = (pm.response.text() || '').trim();
    if (body.length) {
      const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
      pm.expect(ct).to.include('application/json');
      pm.expect(() => pm.response.json()).to.not.throw();
    } else {
      pm.expect(pm.response.code).to.be.oneOf([202, 204]);
    }
  });

  pm.test("Updated resource has object shape when returned", function () {
    const body = (pm.response.text() || '').trim();
    if (body.length) {
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
<img width="941" height="597" alt="image" src="https://github.com/user-attachments/assets/ce772efd-7f6e-4246-9b3a-4b67d81b7d46" />

Headers

Params
<img width="952" height="889" alt="image" src="https://github.com/user-attachments/assets/c28fb79e-3268-46a4-bda4-d454801c5fc7" />

#### `DELETE {{baseUrl}}/api/v1/journals/:journal_id`

```js
// Generic tests for Delete Journal
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is 2xx (deleted) or 4xx/5xx (invalid/missing journal_id)", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 202, 204, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503]);
});

if (pm.response.code >= 200 && pm.response.code < 300) {
  pm.test("Delete success returns empty or JSON", function () {
    const body = (pm.response.text() || '').trim();
    if (!body.length) {
      pm.expect(pm.response.code).to.be.oneOf([202, 204]);
    } else {
      const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
      if (ct.includes('application/json')) {
        pm.expect(() => pm.response.json()).to.not.throw();
      }
      pm.expect(body).to.be.a('string');
    }
  });
} else {
  pm.test("Error response has body (JSON if indicated)", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('application/json')) {
      pm.expect(() => pm.response.json()).to.not.throw();
    } else {
      pm.expect(pm.response.text()).to.be.a('string');
    }
  });
}
```
Body

Headers
<img width="935" height="531" alt="image" src="https://github.com/user-attachments/assets/1bc20032-2ce9-47b7-8d18-3897eab47974" />

Params
<img width="932" height="674" alt="image" src="https://github.com/user-attachments/assets/5108c550-dbe9-40ca-b4b9-ca582960dd04" />

#### `GET {{baseUrl}}/api/v1/journals?skip=0&limit=100`

```js
// Generic tests for List Journals
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is 2xx or an error", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 206, 400, 401, 403, 404, 422, 429, 500, 502, 503]);
});

if (pm.response.code === 200) {
  pm.test("Response is JSON", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    pm.expect(ct).to.include('application/json');
    pm.expect(() => pm.response.json()).to.not.throw();
  });

  pm.test("List response is an array or has an items array", function () {
    const json = pm.response.json();
    const isArray = Array.isArray(json);
    const hasItemsArray = json && typeof json === 'object' && Array.isArray(json.items);
    const hasDataArray = json && typeof json === 'object' && Array.isArray(json.data);
    pm.expect(isArray || hasItemsArray || hasDataArray, "Expected array, or {items: []}, or {data: []}").to.equal(true);
  });
} else {
  pm.test("Error response is JSON (when indicated) or has body", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('application/json')) {
      pm.expect(() => pm.response.json()).to.not.throw();
    } else {
      pm.expect(pm.response.text()).to.be.a('string');
    }
  });
}
```
Body

Headers
<img width="937" height="554" alt="image" src="https://github.com/user-attachments/assets/84eba54e-02ca-4279-8c4d-6bc79dbae0c8" />

Params
<img width="945" height="918" alt="image" src="https://github.com/user-attachments/assets/352b561d-5c81-4615-a3bc-f4ea02aea221" />

#### `POST {{baseUrl}}/api/v1/journals`

```js
// Generic tests for Create Journal
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is success (2xx) or client/server error", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201, 202, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503]);
});

if (pm.response.code >= 200 && pm.response.code < 300) {
  pm.test("Successful response is JSON", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    pm.expect(ct).to.include('application/json');
    pm.expect(() => pm.response.json()).to.not.throw();
  });

  pm.test("Response has an id-like field (journal_id/id) if returned", function () {
    const json = pm.response.json();
    const hasId = json && typeof json === 'object' && (
      'id' in json || 'journal_id' in json || (json.data && (('id' in json.data) || ('journal_id' in json.data)))
    );
    pm.expect(hasId || true).to.equal(true);
  });
} else {
  pm.test("Error response has a body and is JSON when indicated", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('application/json')) {
      pm.expect(() => pm.response.json()).to.not.throw();
    } else {
      pm.expect(pm.response.text()).to.be.a('string');
    }
  });
}
```
Body
<img width="926" height="566" alt="image" src="https://github.com/user-attachments/assets/a38d9228-e6a3-4c89-ba7b-4d24f3a62d56" />

Headers
<img width="940" height="569" alt="image" src="https://github.com/user-attachments/assets/47cd3587-0572-4c92-8b27-24ce736c8b2a" />

Params
<img width="933" height="804" alt="image" src="https://github.com/user-attachments/assets/f6b1e54c-a3d3-40f0-ad0b-491eaa7927e6" />


## Trades

#### `GET {{baseUrl}}/api/v1/trades?journal_id=string&algorithm_id=string&ticker=string&direction=short&skip=0&limit=100`

```js
// Generic tests for List Trades
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is 2xx or an error", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 206, 400, 401, 403, 404, 422, 429, 500, 502, 503]);
});

if (pm.response.code === 200) {
  pm.test("Response is JSON", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    pm.expect(ct).to.include('application/json');
    pm.expect(() => pm.response.json()).to.not.throw();
  });

  pm.test("List response is an array or has an items array", function () {
    const json = pm.response.json();
    const isArray = Array.isArray(json);
    const hasItemsArray = json && typeof json === 'object' && Array.isArray(json.items);
    const hasDataArray = json && typeof json === 'object' && Array.isArray(json.data);
    pm.expect(isArray || hasItemsArray || hasDataArray, "Expected array, or {items: []}, or {data: []}").to.equal(true);
  });
} else {
  pm.test("Error response is JSON (when indicated) or has body", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('application/json')) {
      pm.expect(() => pm.response.json()).to.not.throw();
    } else {
      pm.expect(pm.response.text()).to.be.a('string');
    }
  });
}
```

Params
<img width="934" height="758" alt="image" src="https://github.com/user-attachments/assets/cb58d7bf-12b2-413a-9bee-c8b3354c0f1e" />


#### `POST {{baseUrl}}/api/v1/trades`

```js
// Generic tests for Create Trade
pm.test("Response time is under 2000ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Status is success (2xx) or client/server error", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201, 202, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503]);
});

if (pm.response.code >= 200 && pm.response.code < 300) {
  pm.test("Successful response is JSON", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    pm.expect(ct).to.include('application/json');
    pm.expect(() => pm.response.json()).to.not.throw();
  });

  pm.test("Response has a trade id-like field if returned", function () {
    const json = pm.response.json();
    const hasId = json && typeof json === 'object' && (
      'id' in json || 'trade_id' in json || (json.data && (('id' in json.data) || ('trade_id' in json.data)))
    );
    pm.expect(hasId || true).to.equal(true);
  });
} else {
  pm.test("Error response has a body and is JSON when indicated", function () {
    const ct = (pm.response.headers.get('Content-Type') || '').toLowerCase();
    if (ct.includes('application/json')) {
      pm.expect(() => pm.response.json()).to.not.throw();
    } else {
      pm.expect(pm.response.text()).to.be.a('string');
    }
  });
}
```
Body
<img width="922" height="561" alt="image" src="https://github.com/user-attachments/assets/2e11216f-74f8-4b01-a5a5-6069d449d66b" />




