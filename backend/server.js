const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'roi_simulator.db');
const db = new sqlite3.Database(dbPath, err => {
    if (err) console.error('SQLite connection error:', err.message);
    else console.log('Connected to SQLite DB at', dbPath);
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS user_inputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_name TEXT,
    monthly_invoice_volume INTEGER,
    num_ap_staff INTEGER,
    avg_hours_per_invoice REAL,
    hourly_wage REAL,
    error_rate_manual REAL,
    error_rate_auto REAL,
    error_cost REAL,
    time_horizon_months INTEGER,
    one_time_implementation_cost REAL,
    automated_cost_per_invoice REAL,
    min_roi_boost_factor REAL
)
`;

db.run(createTableQuery, err => {
    if (err) console.error('Error creating table:', err.message);
    else console.log('Table ready');
});

function laborCostManual(num_ap_staff, hourly_wage, avg_hours_per_invoice, monthly_invoice_volume) {
    return num_ap_staff * hourly_wage * avg_hours_per_invoice * monthly_invoice_volume;
}

function autoCost(monthly_invoice_volume, automated_cost_per_invoice) {
    return monthly_invoice_volume * automated_cost_per_invoice;
}

function errorSavings(error_rate_manual, error_rate_auto, monthly_invoice_volume, error_cost) {
    return (error_rate_manual - error_rate_auto) * monthly_invoice_volume * error_cost;
}

function monthlySavings(labor_cost_manual, error_savings, auto_cost) {
    return (labor_cost_manual + error_savings) - auto_cost;
}

function applyBias(monthly_savings, min_roi_boost_factor) {
    return monthly_savings * min_roi_boost_factor;
}

function cumulativeSavings(monthly_savings, time_horizon_months) {
    return monthly_savings * time_horizon_months;
}

function netSavings(cumulative_savings, one_time_implementation_cost) {
    return cumulative_savings - one_time_implementation_cost;
}

function paybackMonths(one_time_implementation_cost, monthly_savings) {
    return monthly_savings === 0 ? Infinity : one_time_implementation_cost / monthly_savings;
}

function roiPercentage(net_savings, one_time_implementation_cost) {
    return (net_savings / one_time_implementation_cost) * 100;
}

app.post('/simulate', (req, res) => {
    console.log("[INFO] /simulate route called");

    if (!req.body) {
        console.error("[ERROR] req.body is undefined!");
        return res.status(400).json({ message: "No body received" });
    }

    console.log("[INFO] req.body received:", req.body);
    const {
        monthly_invoice_volume,
        num_ap_staff,
        avg_hours_per_invoice,
        hourly_wage,
        error_rate_manual,
        error_rate_auto,
        error_cost,
        time_horizon_months,
        one_time_implementation_cost,
        automated_cost_per_invoice,
        min_roi_boost_factor
    } = req.body;

    const labor = laborCostManual(num_ap_staff, hourly_wage, avg_hours_per_invoice, monthly_invoice_volume);
    const auto = autoCost(monthly_invoice_volume, automated_cost_per_invoice);
    const errorSave = errorSavings(error_rate_manual, error_rate_auto, monthly_invoice_volume, error_cost);
    const monthlySave = monthlySavings(labor, errorSave, auto);
    const biasedMonthly = applyBias(monthlySave, min_roi_boost_factor);
    const cumulative = cumulativeSavings(biasedMonthly, time_horizon_months);
    const net = netSavings(cumulative, one_time_implementation_cost);
    const payback = paybackMonths(one_time_implementation_cost, biasedMonthly);
    const roi = roiPercentage(net, one_time_implementation_cost);

    res.json({
        monthly_savings: biasedMonthly,
        cumulative_savings: cumulative,
        net_savings: net,
        payback_months: payback,
        roi_percentage: roi
    });
});

app.post('/scenarios', (req, res) => {
    const {
        scenario_name,
        monthly_invoice_volume,
        num_ap_staff,
        avg_hours_per_invoice,
        hourly_wage,
        error_rate_manual,
        error_rate_auto,
        error_cost,
        time_horizon_months,
        one_time_implementation_cost,
        automated_cost_per_invoice,
        min_roi_boost_factor
    } = req.body;

    const insertQuery = `
    INSERT INTO user_inputs
    (scenario_name, monthly_invoice_volume, num_ap_staff, avg_hours_per_invoice, hourly_wage, error_rate_manual, error_rate_auto, error_cost, time_horizon_months, one_time_implementation_cost, automated_cost_per_invoice, min_roi_boost_factor)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        insertQuery,
        [scenario_name, monthly_invoice_volume, num_ap_staff, avg_hours_per_invoice, hourly_wage, error_rate_manual, error_rate_auto, error_cost, time_horizon_months, one_time_implementation_cost, automated_cost_per_invoice, min_roi_boost_factor],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'Error saving scenario' });
            } else {
                return res.status(200).json({ message: 'Scenario saved', id: this.lastID });
            }
        }
    );
});

app.get('/scenarios/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM user_inputs WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Error fetching scenario' });
        } else if (!row) {
            res.status(404).json({ message: 'Scenario not found' });
        } else {
            res.json(row);
        }
    });
});

app.get('/scenarios', (req, res) => {
    db.all('SELECT * FROM user_inputs', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Error fetching scenarios' });
        } else {
            res.json(rows);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
