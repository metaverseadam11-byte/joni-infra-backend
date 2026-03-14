# 🔌 Integration Examples

**Ready-to-use code snippets for AI agents in different languages.**

---

## JavaScript / Node.js

### Basic Domain Registration

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/v1';
const API_KEY = 'your-api-key-here';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

async function registerDomain(domainName, customerData) {
  try {
    // 1. Check availability
    const searchResult = await client.get('/domains/search', {
      params: {
        query: domainName.split('.')[0],
        tlds: domainName.split('.')[1]
      }
    });
    
    const domain = searchResult.data.results[0];
    
    if (!domain.available) {
      throw new Error('Domain not available');
    }
    
    console.log(`✓ ${domainName} is available for $${domain.pricing.registration}`);
    
    // 2. Create payment
    const paymentResult = await client.post('/payments/create', {
      amount: domain.pricing.registration,
      chain: 'ethereum'
    });
    
    const payment = paymentResult.data.payment;
    
    console.log(`💰 Send ${payment.amount} ${payment.token} to ${payment.address}`);
    
    // 3. Wait for payment (you'll implement this based on your wallet)
    const txHash = await waitForPayment(payment);
    
    // 4. Verify payment
    await client.post('/payments/verify', {
      paymentId: payment.id,
      txHash
    });
    
    console.log('✓ Payment verified');
    
    // 5. Register domain
    const registerResult = await client.post('/domains/register', {
      domain: domainName,
      period: 1,
      nameservers: ['ns1.example.com', 'ns2.example.com'],
      contacts: customerData,
      privacyProtection: true,
      payment: {
        method: 'crypto',
        paymentId: payment.id,
        txHash
      }
    });
    
    console.log(`✅ Domain registered! Order ID: ${registerResult.data.orderId}`);
    
    return registerResult.data;
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
const customer = {
  name: 'John Doe',
  email: 'john@example.com',
  address1: '123 Main St',
  city: 'New York',
  state: 'NY',
  country: 'US',
  zipcode: '10001',
  phoneCountryCode: '1',
  phone: '5551234567'
};

registerDomain('my-site.com', customer);
```

---

## Python

### With Error Handling & Retries

```python
import requests
import time
from typing import Dict, Optional

class DomainClient:
    def __init__(self, api_key: str, base_url: str = 'http://localhost:3000/api/v1'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Make API request with retry logic"""
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                response = self.session.request(
                    method,
                    f'{self.base_url}{endpoint}',
                    **kwargs
                )
                response.raise_for_status()
                return response.json()
            
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    raise
                
                wait_time = 2 ** attempt
                print(f'Retry {attempt + 1}/{max_retries} after {wait_time}s...')
                time.sleep(wait_time)
    
    def search_domains(self, query: str, tlds: str = 'com,net') -> Dict:
        """Search for available domains"""
        return self._request('GET', '/domains/search', params={
            'query': query,
            'tlds': tlds
        })
    
    def create_payment(self, amount: float, chain: str = 'ethereum') -> Dict:
        """Create payment request"""
        return self._request('POST', '/payments/create', json={
            'amount': amount,
            'chain': chain
        })
    
    def verify_payment(self, payment_id: str, tx_hash: str) -> Dict:
        """Verify payment transaction"""
        return self._request('POST', '/payments/verify', json={
            'paymentId': payment_id,
            'txHash': tx_hash
        })
    
    def register_domain(
        self,
        domain: str,
        contacts: Dict,
        payment_id: str,
        tx_hash: str,
        period: int = 1,
        nameservers: Optional[list] = None
    ) -> Dict:
        """Register a domain"""
        
        if nameservers is None:
            nameservers = ['ns1.example.com', 'ns2.example.com']
        
        return self._request('POST', '/domains/register', json={
            'domain': domain,
            'period': period,
            'nameservers': nameservers,
            'contacts': contacts,
            'privacyProtection': True,
            'payment': {
                'method': 'crypto',
                'paymentId': payment_id,
                'txHash': tx_hash
            }
        })
    
    def get_domain_details(self, order_id: str) -> Dict:
        """Get domain details"""
        return self._request('GET', f'/domains/{order_id}')
    
    def get_hosting_plans(self, type: str = 'linux') -> Dict:
        """Get hosting plans"""
        return self._request('GET', '/hosting/plans', params={'type': type})

# Usage
client = DomainClient('your-api-key-here')

# Search
result = client.search_domains('mysite', 'com,net')
print(f"Found {len(result['results'])} domains")

# Register (after payment)
customer = {
    'name': 'AI Agent',
    'email': 'agent@example.com',
    'address1': '123 AI Street',
    'city': 'San Francisco',
    'state': 'CA',
    'country': 'US',
    'zipcode': '94102',
    'phoneCountryCode': '1',
    'phone': '5551234567'
}

payment = client.create_payment(12.99, 'ethereum')
# ... send payment ...
tx_hash = '0xabc...'

client.verify_payment(payment['payment']['id'], tx_hash)
result = client.register_domain('mysite.com', customer, payment['payment']['id'], tx_hash)
print(f"Registered! Order ID: {result['orderId']}")
```

---

## TypeScript

### Type-Safe Client

```typescript
interface DomainSearchResult {
  domain: string;
  available: boolean;
  pricing?: {
    registration: number;
    renewal: number;
    currency: string;
  };
}

interface Payment {
  id: string;
  address: string;
  amount: string;
  token: string;
  chain: string;
  expiresAt: string;
  status: string;
}

interface CustomerData {
  name: string;
  email: string;
  address1: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  phoneCountryCode: string;
  phone: string;
  company?: string;
}

class DomainAPIClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string, baseURL: string = 'http://localhost:3000/api/v1') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      if (method === 'GET') {
        const params = new URLSearchParams(data);
        url += `?${params}`;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async searchDomains(
    query: string,
    tlds: string = 'com,net'
  ): Promise<{ success: boolean; results: DomainSearchResult[] }> {
    return this.request('GET', '/domains/search', { query, tlds });
  }

  async createPayment(
    amount: number,
    chain: string = 'ethereum'
  ): Promise<{ success: boolean; payment: Payment }> {
    return this.request('POST', '/payments/create', { amount, chain });
  }

  async verifyPayment(
    paymentId: string,
    txHash: string
  ): Promise<{ success: boolean; payment: Payment }> {
    return this.request('POST', '/payments/verify', { paymentId, txHash });
  }

  async registerDomain(
    domain: string,
    contacts: CustomerData,
    paymentId: string,
    txHash: string,
    options?: {
      period?: number;
      nameservers?: string[];
      privacyProtection?: boolean;
    }
  ): Promise<{ success: boolean; orderId: string; domain: string }> {
    return this.request('POST', '/domains/register', {
      domain,
      contacts,
      period: options?.period || 1,
      nameservers: options?.nameservers || ['ns1.example.com', 'ns2.example.com'],
      privacyProtection: options?.privacyProtection ?? true,
      payment: {
        method: 'crypto',
        paymentId,
        txHash
      }
    });
  }
}

// Usage
const client = new DomainAPIClient('your-api-key');

async function main() {
  const result = await client.searchDomains('mysite', 'com');
  console.log(result.results);
}

main();
```

---

## Go

### Concurrent Domain Registration

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "sync"
)

type DomainClient struct {
    APIKey  string
    BaseURL string
    Client  *http.Client
}

type SearchResult struct {
    Success bool `json:"success"`
    Results []struct {
        Domain    string `json:"domain"`
        Available bool   `json:"available"`
        Pricing   *struct {
            Registration float64 `json:"registration"`
            Renewal      float64 `json:"renewal"`
            Currency     string  `json:"currency"`
        } `json:"pricing"`
    } `json:"results"`
}

func NewDomainClient(apiKey string) *DomainClient {
    return &DomainClient{
        APIKey:  apiKey,
        BaseURL: "http://localhost:3000/api/v1",
        Client:  &http.Client{},
    }
}

func (c *DomainClient) request(method, endpoint string, body interface{}) ([]byte, error) {
    var reqBody io.Reader
    
    if body != nil {
        jsonData, err := json.Marshal(body)
        if err != nil {
            return nil, err
        }
        reqBody = bytes.NewBuffer(jsonData)
    }
    
    req, err := http.NewRequest(method, c.BaseURL+endpoint, reqBody)
    if err != nil {
        return nil, err
    }
    
    req.Header.Set("Authorization", "Bearer "+c.APIKey)
    req.Header.Set("Content-Type", "application/json")
    
    resp, err := c.Client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    return io.ReadAll(resp.Body)
}

func (c *DomainClient) SearchDomains(query string, tlds string) (*SearchResult, error) {
    data, err := c.request("GET", fmt.Sprintf("/domains/search?query=%s&tlds=%s", query, tlds), nil)
    if err != nil {
        return nil, err
    }
    
    var result SearchResult
    if err := json.Unmarshal(data, &result); err != nil {
        return nil, err
    }
    
    return &result, nil
}

// Concurrent search
func (c *DomainClient) SearchMultiple(queries []string) map[string]*SearchResult {
    results := make(map[string]*SearchResult)
    var mu sync.Mutex
    var wg sync.WaitGroup
    
    for _, query := range queries {
        wg.Add(1)
        go func(q string) {
            defer wg.Done()
            result, err := c.SearchDomains(q, "com,net")
            if err == nil {
                mu.Lock()
                results[q] = result
                mu.Unlock()
            }
        }(query)
    }
    
    wg.Wait()
    return results
}

func main() {
    client := NewDomainClient("your-api-key")
    
    // Search multiple domains concurrently
    queries := []string{"site1", "site2", "site3"}
    results := client.SearchMultiple(queries)
    
    for query, result := range results {
        fmt.Printf("%s: %d results\n", query, len(result.Results))
    }
}
```

---

## cURL Examples

### Complete Registration Flow

```bash
#!/bin/bash

API_BASE="http://localhost:3000/api/v1"
API_KEY="your-api-key-here"
DOMAIN="mysite.com"

# 1. Search
echo "🔍 Searching for domain..."
SEARCH_RESULT=$(curl -s -X GET "$API_BASE/domains/search?query=mysite&tlds=com" \
  -H "Authorization: Bearer $API_KEY")

echo $SEARCH_RESULT | jq '.'

AVAILABLE=$(echo $SEARCH_RESULT | jq -r '.results[0].available')
PRICE=$(echo $SEARCH_RESULT | jq -r '.results[0].pricing.registration')

if [ "$AVAILABLE" != "true" ]; then
  echo "❌ Domain not available"
  exit 1
fi

echo "✅ Domain available for \$$PRICE"

# 2. Create payment
echo "💰 Creating payment..."
PAYMENT_RESULT=$(curl -s -X POST "$API_BASE/payments/create" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"amount\": $PRICE, \"chain\": \"ethereum\"}")

echo $PAYMENT_RESULT | jq '.'

PAYMENT_ID=$(echo $PAYMENT_RESULT | jq -r '.payment.id')
PAYMENT_ADDRESS=$(echo $PAYMENT_RESULT | jq -r '.payment.address')
PAYMENT_AMOUNT=$(echo $PAYMENT_RESULT | jq -r '.payment.amount')

echo "Send $PAYMENT_AMOUNT USDC to $PAYMENT_ADDRESS"
echo "Waiting for payment..."

# 3. Simulate payment (in real scenario, you'd send crypto here)
read -p "Enter transaction hash: " TX_HASH

# 4. Verify payment
echo "✓ Verifying payment..."
VERIFY_RESULT=$(curl -s -X POST "$API_BASE/payments/verify" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"paymentId\": \"$PAYMENT_ID\", \"txHash\": \"$TX_HASH\"}")

echo $VERIFY_RESULT | jq '.'

# 5. Register domain
echo "📝 Registering domain..."
REGISTER_RESULT=$(curl -s -X POST "$API_BASE/domains/register" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "'"$DOMAIN"'",
    "period": 1,
    "nameservers": ["ns1.example.com", "ns2.example.com"],
    "contacts": {
      "name": "John Doe",
      "email": "john@example.com",
      "address1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "US",
      "zipcode": "10001",
      "phoneCountryCode": "1",
      "phone": "5551234567"
    },
    "privacyProtection": true,
    "payment": {
      "method": "crypto",
      "paymentId": "'"$PAYMENT_ID"'",
      "txHash": "'"$TX_HASH"'"
    }
  }')

echo $REGISTER_RESULT | jq '.'

ORDER_ID=$(echo $REGISTER_RESULT | jq -r '.orderId')
echo "✅ Domain registered! Order ID: $ORDER_ID"
```

---

**Copy, adapt, ship. 🐙**
