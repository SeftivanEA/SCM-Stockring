<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Stockring SCM - Backend API</title>
    <style>
        :root {
            --bg-krem: #FFF9E6;
            --krem: #F9E6A8;
            --amber: #F2A900;
            --orange-dark: #CC6F00;
            --brown-dark: #4D2A00;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: var(--bg-krem);
            color: var(--brown-dark);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .container {
            max-width: 800px;
            width: 100%;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(77, 42, 0, 0.08);
            border: 1px solid var(--krem);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, var(--brown-dark), #663800);
            color: #ffffff;
            padding: 32px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
        }
        .header p {
            color: var(--krem);
            font-size: 15px;
        }
        .badge-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(242, 169, 0, 0.25);
            color: #fff;
            padding: 4px 14px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 14px;
            border: 1px solid var(--amber);
        }
        .dot {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
        }
        .content {
            padding: 32px;
        }
        .callout {
            background: #FFFDF5;
            border-left: 4px solid var(--amber);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 14px;
            line-height: 1.6;
        }
        .btn-frontend {
            display: inline-block;
            background: var(--amber);
            color: var(--brown-dark);
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            margin-top: 10px;
            transition: all 0.2s;
        }
        .btn-frontend:hover {
            background: var(--orange-dark);
            color: #fff;
        }
        .section-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 16px;
            color: var(--brown-dark);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
        }
        .api-card {
            background: #FAFAFA;
            border: 1px solid #ECECEC;
            border-radius: 10px;
            padding: 16px;
            text-decoration: none;
            color: inherit;
            display: block;
            transition: all 0.2s;
        }
        .api-card:hover {
            border-color: var(--amber);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(242, 169, 0, 0.15);
        }
        .card-tag {
            font-size: 11px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            background: var(--krem);
            color: var(--brown-dark);
            display: inline-block;
            margin-bottom: 8px;
        }
        .card-title {
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 4px;
            color: var(--brown-dark);
        }
        .card-endpoint {
            font-size: 12px;
            font-family: monospace;
            color: var(--orange-dark);
            word-break: break-all;
        }
        .footer {
            background: #F8F8F8;
            padding: 16px 32px;
            border-top: 1px solid #EEE;
            text-align: center;
            font-size: 13px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Stockring SCM</h1>
            <p>Sistem Manajemen Stok Barang · REST API Server</p>
            <div class="badge-status">
                <span class="dot"></span> Backend API Aktif & Terhubung ke MySQL
            </div>
        </div>

        <div class="content">
            <div class="callout">
                <strong>Catatan Antarmuka:</strong><br>
                Halaman ini adalah server <strong>Backend API</strong> (port 8000). Untuk membuka antarmuka visual pengguna (React UI):
                <br>
                <a href="http://localhost:5173" target="_blank" class="btn-frontend">Buka Web Frontend (http://localhost:5173) &rarr;</a>
            </div>

            <div class="section-title">
                Endpoint API Tim B: Stok
            </div>
            <div class="grid">
                <a href="/api/dashboard/summary" target="_blank" class="api-card">
                    <span class="card-tag">GET</span>
                    <div class="card-title">Dashboard Summary</div>
                    <div class="card-endpoint">/api/dashboard/summary</div>
                </a>
                <a href="/api/items" target="_blank" class="api-card">
                    <span class="card-tag">GET / POST</span>
                    <div class="card-title">Daftar & Form Barang</div>
                    <div class="card-endpoint">/api/items</div>
                </a>
                <a href="/api/gudang" target="_blank" class="api-card">
                    <span class="card-tag">GET / POST</span>
                    <div class="card-title">Gudang Penyimpanan</div>
                    <div class="card-endpoint">/api/gudang</div>
                </a>
                <a href="/api/transaksi" target="_blank" class="api-card">
                    <span class="card-tag">GET / POST</span>
                    <div class="card-title">Riwayat Transaksi</div>
                    <div class="card-endpoint">/api/transaksi</div>
                </a>
            </div>
        </div>

        <div class="footer">
            SCM-Stockring Kelompok 6 · Capstone Project SCM
        </div>
    </div>
</body>
</html>
