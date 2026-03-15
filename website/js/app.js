// Main application logic
const API_BASE = 'https://porkbun-api-production.up.railway.app/api/v1';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 joni.bz initialized');
    
    // Register route handlers
    router.register('search', loadSearchPage);
    router.register('admin', loadAdminPage);
});

// Load search page content
async function loadSearchPage() {
    const container = document.getElementById('searchContent');
    
    container.innerHTML = `
        <div class="search-container">
            <!-- Step 1: Domain Search -->
            <div id="step1" class="card">
                <h1>🌐 Register Your Domain</h1>
                <p class="subtitle">Pay with crypto. Instant registration.</p>

                <div class="input-group">
                    <label for="domain">Domain Name</label>
                    <div class="domain-input-wrapper">
                        <input type="text" id="domain" placeholder="example.com" />
                    </div>
                </div>

                <div class="input-group">
                    <label for="crypto">Payment Method</label>
                    <select id="crypto">
                        <option value="ethereum">Ethereum (ETH)</option>
                        <option value="usdc">USD Coin (USDC)</option>
                        <option value="solana">Solana (SOL)</option>
                        <option value="bitcoin">Bitcoin (BTC)</option>
                    </select>
                </div>

                <div class="input-group">
                    <label for="email">Email (optional)</label>
                    <input type="email" id="email" placeholder="your@email.com" />
                </div>

                <div id="availability-status"></div>

                <button id="checkBtn" class="btn btn-primary" onclick="checkDomain()">
                    Check Availability & Create Order
                </button>
            </div>

            <!-- Step 2: Payment -->
            <div id="step2" class="card hidden">
                <h1>💰 Payment</h1>
                
                <div id="orderStatus"></div>

                <div class="payment-details">
                    <div class="payment-info">
                        <strong>Domain:</strong>
                        <span id="orderDomain"></span>
                    </div>

                    <div class="price-display">
                        <div class="price-row">
                            <span>Price (USD):</span>
                            <strong id="priceUsd"></strong>
                        </div>
                        <div class="price-row">
                            <span>Price (Crypto):</span>
                            <strong id="priceCrypto"></strong>
                        </div>
                    </div>

                    <div class="timer" id="timer">30:00</div>

                    <div class="payment-info">
                        <strong>Send exactly this amount to:</strong>
                        <div class="wallet-address" id="walletAddress"></div>
                        <button class="copy-btn" onclick="copyAddress()">📋 Copy Address</button>
                    </div>

                    <div class="qr-code" id="qrCode"></div>

                    <div class="status info">
                        ⏳ Waiting for payment... This page will auto-update.
                    </div>
                </div>

                <button class="btn btn-secondary" onclick="checkStatus()">
                    🔄 Check Payment Status
                </button>
            </div>

            <!-- Step 3: Success -->
            <div id="step3" class="card hidden">
                <h1>✅ Success!</h1>
                
                <div class="status success">
                    🎉 Your domain has been registered!
                </div>

                <div class="payment-details">
                    <div class="payment-info">
                        <strong>Domain:</strong>
                        <span id="successDomain"></span>
                    </div>
                    <div class="payment-info">
                        <strong>Transaction:</strong>
                        <span id="txHash" style="word-break: break-all; font-family: monospace;"></span>
                    </div>
                </div>

                <button class="btn btn-primary" onclick="location.reload()">
                    Register Another Domain
                </button>
            </div>
        </div>
    `;

    // Load QR code library
    loadScript('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js');
    
    // Add search page styles
    addSearchStyles();
}

// Load admin page content
async function loadAdminPage() {
    const container = document.getElementById('adminContent');
    
    container.innerHTML = `
        <!-- Auth Modal -->
        <div id="authModal" class="auth-modal">
            <div class="auth-box">
                <h2>Admin Login</h2>
                <input type="password" id="apiKey" placeholder="Enter API Key" />
                <button class="btn btn-primary" onclick="authenticate()">Login</button>
            </div>
        </div>

        <div id="dashboard" class="dashboard hidden">
            <div class="dashboard-header">
                <h1>📊 Admin Dashboard</h1>
                <p>Crypto Domain Platform</p>
            </div>

            <div class="stats">
                <div class="stat-card">
                    <h3>Total Orders</h3>
                    <div class="value" id="totalOrders">-</div>
                </div>
                <div class="stat-card">
                    <h3>Pending</h3>
                    <div class="value" id="pendingOrders">-</div>
                </div>
                <div class="stat-card">
                    <h3>Completed</h3>
                    <div class="value" id="completedOrders">-</div>
                </div>
                <div class="stat-card">
                    <h3>Revenue (Est.)</h3>
                    <div class="value" id="totalRevenue">$0</div>
                </div>
            </div>

            <div class="filters">
                <div class="filter-group">
                    <select id="statusFilter">
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirming">Confirming</option>
                        <option value="paid">Paid</option>
                        <option value="registered">Registered</option>
                        <option value="expired">Expired</option>
                        <option value="failed">Failed</option>
                    </select>
                    <button class="btn btn-primary" onclick="loadOrders()">🔄 Refresh</button>
                </div>
            </div>

            <div class="orders-table">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Domain</th>
                            <th>Status</th>
                            <th>Price</th>
                            <th>Crypto</th>
                            <th>Email</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody id="ordersTable">
                        <tr>
                            <td colspan="7" class="loading-cell">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Add admin styles
    addAdminStyles();

    // Check for saved API key
    const savedKey = localStorage.getItem('adminApiKey');
    if (savedKey) {
        window.apiKey = savedKey;
        document.getElementById('apiKey').value = savedKey;
        authenticate();
    }
}

// Domain check and order creation
let currentOrderId = null;
let checkInterval = null;
let timerInterval = null;
let expiresAt = null;

async function checkDomain() {
    const domain = document.getElementById('domain').value.trim();
    const crypto = document.getElementById('crypto').value;
    const email = document.getElementById('email').value.trim();

    if (!domain) {
        showStatus('error', 'Please enter a domain name');
        return;
    }

    const btn = document.getElementById('checkBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Checking...';

    try {
        // Check availability
        const checkRes = await fetch(`${API_BASE}/domains/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain })
        });

        const checkData = await checkRes.json();

        if (!checkData.success) {
            throw new Error(checkData.error);
        }

        if (!checkData.available) {
            showStatus('error', '❌ Domain is not available');
            btn.disabled = false;
            btn.innerHTML = 'Check Availability & Create Order';
            return;
        }

        // Create order (using fast endpoint to avoid timeout)
        const orderRes = await fetch(`${API_BASE}/orders/create-fast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                domain,
                crypto_currency: crypto,
                customer_email: email || null
            })
        });

        const orderData = await orderRes.json();

        if (!orderData.success) {
            throw new Error(orderData.error);
        }

        // Debug: log order data
        console.log('Order data received:', orderData.order);

        // Show payment screen
        showPaymentScreen(orderData.order);

    } catch (err) {
        showStatus('error', err.message);
        btn.disabled = false;
        btn.innerHTML = 'Check Availability & Create Order';
    }
}

function showPaymentScreen(order) {
    currentOrderId = order.order_id;
    expiresAt = order.expires_at;

    // Update UI
    document.getElementById('orderDomain').textContent = order.domain;
    document.getElementById('priceUsd').textContent = '$' + order.price_usd.toFixed(2);
    document.getElementById('priceCrypto').textContent = order.price_crypto + ' ' + order.crypto_currency;
    document.getElementById('walletAddress').textContent = order.wallet_address;

    // Generate QR code
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '';
    if (window.QRCode) {
        QRCode.toCanvas(order.wallet_address, { width: 256 }, (err, canvas) => {
            if (!err) {
                qrContainer.appendChild(canvas);
            }
        });
    }

    // Show step 2
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');

    // Start timer
    startTimer();

    // Start checking for payment
    checkInterval = setInterval(checkStatus, 10000); // Check every 10 seconds
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = expiresAt - now;

        if (remaining <= 0) {
            document.getElementById('timer').textContent = 'EXPIRED';
            clearInterval(timerInterval);
            clearInterval(checkInterval);
            showStatus('error', '⏰ Order expired. Please create a new order.');
            return;
        }

        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

async function checkStatus() {
    if (!currentOrderId) return;

    try {
        const res = await fetch(`${API_BASE}/orders/${currentOrderId}/status`);
        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error);
        }

        const status = data.status;

        if (status === 'registered' || status === 'completed') {
            clearInterval(checkInterval);
            clearInterval(timerInterval);
            showSuccessScreen(data);
        } else if (status === 'confirming') {
            showStatus('info', '⏳ Payment detected! Waiting for confirmations...');
        } else if (status === 'paid') {
            showStatus('warning', '🔄 Payment confirmed! Registering domain...');
        } else if (status === 'failed') {
            clearInterval(checkInterval);
            clearInterval(timerInterval);
            showStatus('error', '❌ Registration failed. Please contact support.');
        }
    } catch (err) {
        console.error('Status check error:', err);
    }
}

function showSuccessScreen(data) {
    document.getElementById('successDomain').textContent = data.domain;
    document.getElementById('txHash').textContent = data.tx_hash || 'N/A';

    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.remove('hidden');
}

function copyAddress() {
    const address = document.getElementById('walletAddress').textContent;
    navigator.clipboard.writeText(address);
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✅ Copied!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}

function showStatus(type, message) {
    const statusDiv = document.getElementById('availability-status');
    if (statusDiv) {
        statusDiv.className = `status ${type}`;
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
    }
}

// Admin functions
async function authenticate() {
    const key = document.getElementById('apiKey').value;
    if (!key) {
        alert('Please enter API key');
        return;
    }

    window.apiKey = key;
    localStorage.setItem('adminApiKey', key);

    // Try to load orders to verify key
    const success = await loadOrders();
    if (success) {
        document.getElementById('authModal').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    } else {
        alert('Invalid API key');
        localStorage.removeItem('adminApiKey');
        window.apiKey = null;
    }
}

async function loadOrders() {
    const status = document.getElementById('statusFilter')?.value || '';
    
    try {
        const url = `${API_BASE}/admin/orders${status ? '?status=' + status : ''}`;
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${window.apiKey}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to load orders');
        }

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error);
        }

        renderOrders(data.orders);
        updateStats(data.orders);
        return true;
    } catch (err) {
        console.error('Load error:', err);
        return false;
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTable');
    
    if (!tbody) return;
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No orders found</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.order_uuid.substring(0, 8)}...</td>
            <td><strong>${order.domain}</strong></td>
            <td><span class="status-badge status-${order.payment_status}">${order.payment_status}</span></td>
            <td>$${order.price_usd.toFixed(2)}</td>
            <td>${order.price_crypto} ${order.crypto_currency}</td>
            <td>${order.customer_email || '-'}</td>
            <td>${new Date(order.created_at * 1000).toLocaleString()}</td>
        </tr>
    `).join('');
}

function updateStats(orders) {
    const total = orders.length;
    const pending = orders.filter(o => o.payment_status === 'pending').length;
    const completed = orders.filter(o => o.payment_status === 'registered').length;
    const revenue = orders
        .filter(o => o.payment_status === 'registered')
        .reduce((sum, o) => sum + o.price_usd, 0);

    const elements = {
        totalOrders: total,
        pendingOrders: pending,
        completedOrders: completed,
        totalRevenue: '$' + revenue.toFixed(2)
    };

    Object.keys(elements).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = elements[id];
    });
}

// Utility functions
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function addSearchStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .search-container {
            max-width: 600px;
            margin: 100px auto 40px;
        }
        
        .card {
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .card h1 {
            color: var(--primary);
            font-size: 32px;
            margin-bottom: 8px;
        }
        
        .subtitle {
            color: var(--gray);
            margin-bottom: 32px;
        }
        
        .input-group {
            margin-bottom: 20px;
        }
        
        .input-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        
        .input-group input,
        .input-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .input-group input:focus,
        .input-group select:focus {
            outline: none;
            border-color: var(--primary);
        }
        
        .payment-details {
            background: var(--gray-light);
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .payment-info {
            margin-bottom: 16px;
        }
        
        .payment-info strong {
            display: block;
            margin-bottom: 4px;
            color: #333;
        }
        
        .wallet-address {
            background: white;
            padding: 12px;
            border-radius: 6px;
            word-break: break-all;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            border: 2px solid #e0e0e0;
            margin-top: 8px;
        }
        
        .qr-code {
            text-align: center;
            margin: 20px 0;
        }
        
        .qr-code canvas {
            max-width: 256px;
            height: auto;
        }
        
        .copy-btn {
            background: var(--success);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 8px;
        }
        
        .copy-btn:hover {
            opacity: 0.9;
        }
        
        .timer {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: var(--primary);
            margin: 20px 0;
        }
        
        .price-display {
            background: white;
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
        }
        
        .price-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
    `;
    document.head.appendChild(style);
}

function addAdminStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .auth-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .auth-box {
            background: white;
            padding: 32px;
            border-radius: 8px;
            max-width: 400px;
            width: 90%;
        }
        
        .auth-box h2 {
            margin-bottom: 16px;
        }
        
        .auth-box input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 16px;
            font-size: 14px;
        }
        
        .dashboard {
            padding: 100px 0 40px;
        }
        
        .dashboard-header {
            background: white;
            padding: 24px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: var(--shadow-md);
        }
        
        .dashboard-header h1 {
            color: #333;
            margin-bottom: 8px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-md);
        }
        
        .stat-card h3 {
            color: var(--gray);
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .stat-card .value {
            font-size: 32px;
            font-weight: bold;
            color: var(--primary);
        }
        
        .filters {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: var(--shadow-md);
        }
        
        .filter-group {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }
        
        .filter-group select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .orders-table {
            background: white;
            border-radius: 8px;
            box-shadow: var(--shadow-md);
            overflow: hidden;
        }
        
        .orders-table table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .orders-table th {
            background: var(--gray-light);
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .orders-table td {
            padding: 12px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .orders-table tr:hover {
            background: var(--gray-light);
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-confirming {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .status-paid, .status-registered {
            background: #d4edda;
            color: #155724;
        }
        
        .status-expired, .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .loading-cell {
            text-align: center;
            padding: 40px;
            color: var(--gray);
        }
    `;
    document.head.appendChild(style);
}
