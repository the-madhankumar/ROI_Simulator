import { Component } from "react";
import './index.css';

class Inputs extends Component {
    state = {
        scenario_name: '',
        monthly_invoice_volume: '',
        num_ap_staff: '',
        avg_hours_per_invoice: '',
        hourly_wage: '',
        error_rate_manual: '',
        error_cost: '',
        time_horizon_months: '',
        one_time_implementation_cost: '',
    }

    onSubmitHandler = async (e) => {
        e.preventDefault();

        const {
            scenario_name,
            monthly_invoice_volume,
            num_ap_staff,
            avg_hours_per_invoice,
            hourly_wage,
            error_rate_manual,
            error_cost,
            time_horizon_months,
            one_time_implementation_cost
        } = this.state;

        const payload = {
            scenario_name,
            monthly_invoice_volume: Number(monthly_invoice_volume),
            num_ap_staff: Number(num_ap_staff),
            avg_hours_per_invoice: Number(avg_hours_per_invoice),
            hourly_wage: Number(hourly_wage),
            error_rate_manual: Number(error_rate_manual),
            error_rate_auto: 0.01,
            error_cost: Number(error_cost),
            time_horizon_months: Number(time_horizon_months),
            one_time_implementation_cost: Number(one_time_implementation_cost),
            automated_cost_per_invoice: 2, 
            min_roi_boost_factor: 1.1      
        };

        try {
            console.log("[INFO] trying the call route /simulate")
            const inserResponse = await fetch('http://localhost:5000/scenarios',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if(!inserResponse.ok){
                throw new Error('Failed to Insert the data');
            } else {
                console.log("[INFO] Successfully Inserted the data");
            }

            const response = await fetch('http://localhost:5000/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to fetch simulation results');
            }

            const result = await response.json();
            console.log('Simulation Result:', result);
            alert(`Simulation Result:\nMonthly Savings: $${result.monthly_savings}\nPayback Months: ${result.payback_months}\nROI: ${result.roi_percentage}%`);
        } catch (error) {
            console.error(error);
            alert('Error fetching simulation results');
        }
    }


    // Handlers for each input field
    onScenarioName = (e) => {
        this.setState({ scenario_name: e.target.value });
    }

    onMonthlyInvoice = (e) => {
        this.setState({ monthly_invoice_volume: e.target.value });
    }

    onNumStaff = (e) => {
        this.setState({ num_ap_staff: e.target.value });
    }

    onAvgHours = (e) => {
        this.setState({ avg_hours_per_invoice: e.target.value });
    }

    onHourWage = (e) => {
        this.setState({ hourly_wage: e.target.value });
    }

    onErrorRate = (e) => {
        this.setState({ error_rate_manual: e.target.value });
    }

    onErrorCost = (e) => {
        this.setState({ error_cost: e.target.value });
    }

    onTimeHorizon = (e) => {
        this.setState({ time_horizon_months: e.target.value });
    }

    onImplementationCost = (e) => {
        this.setState({ one_time_implementation_cost: e.target.value });
    }

    render() {
        return (
            <div className="form-container">
                <form className="form-input-container" onSubmit={this.onSubmitHandler}>

                    {/* Scenario Name */}
                    <div className="sub-containers">
                        <label className="LabelText">
                            Enter the Scenario Name
                        </label>
                        <input
                            className="inputs"
                            type="text"
                            value={this.state.scenario_name}
                            onChange={this.onScenarioName}
                        />
                    </div>

                    {/* Monthly Invoice Volume */}
                    <div className="sub-containers">
                        <label className="LabelText">
                            Enter the Monthly Invoice Volume
                        </label>
                        <input
                            className="inputs"
                            type="number"
                            value={this.state.monthly_invoice_volume}
                            onChange={this.onMonthlyInvoice}
                        />
                    </div>

                    {/* Num AP Staff */}
                    <div className="sub-containers">
                        <label className="LabelText">
                            Enter the Number of AP Staff
                        </label>
                        <input
                            className="inputs"
                            type="number"
                            value={this.state.num_ap_staff}
                            onChange={this.onNumStaff}
                        />
                    </div>

                    {/* Average Hours Per Invoice */}
                    <div className="sub-containers">
                        <label className="LabelText">
                            Enter the Average Hours Per Invoice
                        </label>
                        <input
                            className="inputs"
                            type="number"
                            step="0.1"
                            value={this.state.avg_hours_per_invoice}
                            onChange={this.onAvgHours}
                        />
                    </div>

                    {/* Hourly Wage */}
                    <div className="sub-containers">
                        <label className="LabelText">
                            Enter the Hourly Wage
                        </label>
                        <input
                            className="inputs"
                            type="number"
                            value={this.state.hourly_wage}
                            onChange={this.onHourWage}
                        />
                    </div>

                    {/* Error Rate Manual */}
                    <div className="sub-containers">
                        <label className="LabelText">
                            Enter the Error Rate (Manual)
                        </label>
                        <input
                            className="inputs"
                            type="number"
                            step="0.1"
                            value={this.state.error_rate_manual}
                            onChange={this.onErrorRate}
                        />
                    </div>

                    {/* Error Cost */}
                    <div className="sub-containers">
                        <label className="LabelText">
                            Enter the Error Cost
                        </label>
                        <input
                            className="inputs"
                            type="number"
                            value={this.state.error_cost}
                            onChange={this.onErrorCost}
                        />
                    </div>

                    {/* Time Horizon Months */}
                    <div className="sub-containers">
                        <label className="LabelText">
                            Enter the Time Horizon (Months)
                        </label>
                        <input
                            className="inputs"
                            type="number"
                            value={this.state.time_horizon_months}
                            onChange={this.onTimeHorizon}
                        />
                    </div>

                    {/* One Time Implementation Cost */}
                    <div className="sub-containers">
                        <label className="LabelText">
                            Enter the One-Time Implementation Cost
                        </label>
                        <input
                            className="inputs"
                            type="number"
                            value={this.state.one_time_implementation_cost}
                            onChange={this.onImplementationCost}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="sub-containers">
                        <button type="submit" className="submit-btn">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

export default Inputs;
